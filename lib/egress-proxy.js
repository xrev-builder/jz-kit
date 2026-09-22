'use strict';

// The SSRF control (BUILD-SPEC section 7).
//
// Chromium is launched with proxy { server, bypass: '<-loopback>' }, so EVERY connection the
// browser makes arrives here, loopback included. This proxy resolves the hostname itself,
// validates every returned address, and then connects BY IP to the address it validated. The
// name is never resolved a second time, which is what closes DNS rebinding: a pre-check plus
// a hostname connect lets the second lookup return a different address.

const http = require('node:http');
const net = require('node:net');
const dns = require('node:dns');
const { isPublicAddress } = require('./address-policy');

const DEFAULT_PORTS = Object.freeze([80, 443, 8080, 8443]);
const HOP_BY_HOP = ['proxy-connection', 'proxy-authorization', 'connection', 'keep-alive',
  'transfer-encoding', 'te', 'trailer', 'upgrade'];

// host:port, including [v6]:port.
function parseHostPort(authority, fallbackPort) {
  const text = String(authority || '').trim();
  if (!text) return null;
  if (text.startsWith('[')) {
    const close = text.indexOf(']');
    if (close === -1) return null;
    const host = text.slice(1, close);
    const rest = text.slice(close + 1);
    if (rest === '') return { host, port: fallbackPort };
    if (rest[0] !== ':') return null;
    const port = Number(rest.slice(1));
    return Number.isInteger(port) && port > 0 && port < 65536 ? { host, port } : null;
  }
  const colon = text.lastIndexOf(':');
  if (colon === -1) return fallbackPort ? { host: text, port: fallbackPort } : null;
  const host = text.slice(0, colon);
  const port = Number(text.slice(colon + 1));
  if (!host || !Number.isInteger(port) || port <= 0 || port >= 65536) return null;
  return { host, port };
}

function createEgressProxy(opts = {}) {
  const lookup = opts.lookup || ((host, options) => dns.promises.lookup(host, options));
  const allowPorts = new Set(opts.allowPorts || DEFAULT_PORTS);
  const testAllow = opts.testAllow instanceof Set ? opts.testAllow : new Set(opts.testAllow || []);
  // exclusive: the test allow list is the WHOLE allow list. Set in NODE_ENV=test so the
  // fixture suite can never reach the real internet, whatever a recorded fixture references.
  const exclusive = opts.exclusive === true;
  const onBlock = typeof opts.onBlock === 'function' ? opts.onBlock : () => {};

  let sealed = false;
  let connections = 0;
  let blocked = 0;
  const sockets = new Set();

  function track(socket) {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  }

  function block(host, port, reason) {
    blocked += 1;
    try { onBlock({ host, port, reason }); } catch { /* a bad listener must not kill a run */ }
  }

  // Resolve, then judge EVERY returned address. A mixed answer (one public, one private) is
  // a rebinding attempt, not a usable host.
  async function validate(host, port) {
    if (sealed) return { ok: false, reason: 'sealed' };

    const key = `${host}:${port}`;
    if (testAllow.has(key)) {
      if (net.isIP(host)) return { ok: true, address: host };
      let answer;
      try { answer = await lookup(host, { all: true, verbatim: true }); } catch { answer = null; }
      if (!answer || !answer.length) return { ok: false, reason: 'dns_failed' };
      return { ok: true, address: answer[0].address };
    }
    if (exclusive) return { ok: false, reason: 'not_in_test_allow_list' };

    if (!allowPorts.has(port)) return { ok: false, reason: 'port_not_allowed' };

    if (net.isIP(host)) {
      return isPublicAddress(host)
        ? { ok: true, address: host }
        : { ok: false, reason: 'address_not_allowed' };
    }

    let answer;
    try { answer = await lookup(host, { all: true, verbatim: true }); } catch { answer = null; }
    if (!answer || !answer.length) return { ok: false, reason: 'dns_failed' };
    for (const entry of answer) {
      if (!isPublicAddress(entry.address)) return { ok: false, reason: 'address_not_allowed' };
    }
    return { ok: true, address: answer[0].address };
  }

  function refuseRequest(res, reason) {
    if (res.headersSent) { res.destroy(); return; }
    res.writeHead(403, { 'X-Egress-Blocked': reason, 'Content-Type': 'text/plain' });
    res.end(`egress blocked: ${reason}\n`);
  }

  function refuseTunnel(socket, reason) {
    if (socket.destroyed) return;
    // End the response cleanly. Destroying the socket mid-message leaves a client waiting
    // for a body that never arrives.
    socket.end(
      'HTTP/1.1 403 Forbidden\r\n' +
      `X-Egress-Blocked: ${reason}\r\n` +
      'Content-Length: 0\r\nConnection: close\r\n\r\n',
    );
  }

  const server = http.createServer(async (req, res) => {
    let target;
    try {
      // A proxied plain-HTTP request carries an absolute URI.
      const url = new URL(req.url, 'http://invalid.invalid');
      if (!/^https?:$/.test(url.protocol) || url.hostname === 'invalid.invalid') {
        refuseRequest(res, 'not_absolute_uri');
        return;
      }
      target = url;
    } catch {
      refuseRequest(res, 'bad_request_target');
      return;
    }

    const port = target.port ? Number(target.port) : (target.protocol === 'https:' ? 443 : 80);
    const verdict = await validate(target.hostname, port);
    if (!verdict.ok) {
      block(target.hostname, port, verdict.reason);
      refuseRequest(res, verdict.reason);
      return;
    }

    const headers = { ...req.headers };
    for (const name of HOP_BY_HOP) delete headers[name];
    headers.host = target.host;

    connections += 1;
    const upstream = http.request({
      host: verdict.address,          // connect BY the validated IP, never by name
      port,
      method: req.method,
      path: `${target.pathname}${target.search}`,
      headers,
      setHost: false,
    });
    track(upstream);
    upstream.on('socket', (s) => track(s));
    upstream.on('response', (upRes) => {
      res.writeHead(upRes.statusCode || 502, upRes.headers);
      upRes.pipe(res);
    });
    upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.pipe(upstream);
  });

  server.on('connect', async (req, clientSocket, head) => {
    track(clientSocket);
    const parsed = parseHostPort(req.url, 443);
    if (!parsed) {
      block(String(req.url), 0, 'bad_connect_target');
      refuseTunnel(clientSocket, 'bad_connect_target');
      return;
    }
    const verdict = await validate(parsed.host, parsed.port);
    if (!verdict.ok) {
      block(parsed.host, parsed.port, verdict.reason);
      refuseTunnel(clientSocket, verdict.reason);
      return;
    }

    connections += 1;
    const upstream = net.connect({ host: verdict.address, port: parsed.port }, () => {
      if (sealed) { upstream.destroy(); clientSocket.destroy(); return; }
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length) upstream.write(head);
      upstream.pipe(clientSocket);
      clientSocket.pipe(upstream);
    });
    track(upstream);
    upstream.on('error', () => refuseTunnel(clientSocket, 'upstream_error'));
    clientSocket.on('error', () => upstream.destroy());
  });

  server.on('connection', (socket) => {
    if (sealed) { socket.destroy(); return; }
    track(socket);
  });

  return {
    get port() { return server.listening ? server.address().port : null; },

    listen(host = '127.0.0.1', port = 0) {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, () => {
          server.removeListener('error', reject);
          resolve(server.address().port);
        });
      });
    },

    // M6 only: refuse every new connection and destroy every tracked socket, which also
    // kills WebSockets opened before the seal.
    seal() {
      sealed = true;
      for (const socket of sockets) { try { socket.destroy(); } catch { /* already gone */ } }
      sockets.clear();
    },

    stats() {
      return { connections, blocked, sealed, openSockets: sockets.size };
    },

    close() {
      return new Promise((resolve) => {
        for (const socket of sockets) { try { socket.destroy(); } catch { /* already gone */ } }
        sockets.clear();
        server.close(() => resolve());
      });
    },
  };
}

module.exports = { createEgressProxy, parseHostPort, DEFAULT_PORTS };
