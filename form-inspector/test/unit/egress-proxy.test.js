'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const net = require('node:net');
const { createEgressProxy, parseHostPort } = require('../../lib/egress-proxy');

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}
const close = (server) => new Promise((resolve) => server.close(() => resolve()));

// Plain-HTTP request THROUGH the proxy, using an absolute request URI.
function viaProxy(proxyPort, absoluteUrl, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: proxyPort, method, path: absoluteUrl,
      headers: { host: new URL(absoluteUrl).host } }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

// CONNECT tunnel through the proxy; resolves with the status line and a writable socket.
function connectVia(proxyPort, authority) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: proxyPort, method: 'CONNECT', path: authority });
    // Bytes the upstream sent in the same packet as the status line arrive as `head`,
    // not as a later 'data' event. Push them back so callers see one stream.
    req.on('connect', (res, socket, head) => {
      if (head && head.length) socket.unshift(head);
      resolve({ status: res.statusCode, headers: res.headers, socket });
    });
    req.on('response', (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, socket: null, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('parseHostPort handles names, IPv4 and [v6]:port', () => {
  assert.deepEqual(parseHostPort('example.com:443'), { host: 'example.com', port: 443 });
  assert.deepEqual(parseHostPort('127.0.0.1:4101'), { host: '127.0.0.1', port: 4101 });
  assert.deepEqual(parseHostPort('[::1]:8443'), { host: '::1', port: 8443 });
  assert.deepEqual(parseHostPort('[2606:4700::1111]:443'), { host: '2606:4700::1111', port: 443 });
  assert.deepEqual(parseHostPort('[::1]', 443), { host: '::1', port: 443 });
  assert.deepEqual(parseHostPort('example.com', 443), { host: 'example.com', port: 443 });
  for (const bad of ['', null, '[::1', 'host:0', 'host:70000', 'host:abc']) {
    assert.equal(parseHostPort(bad), null, String(bad));
  }
});

test('plain HTTP is proxied to an allow-listed origin and the Host header survives', async () => {
  let seenHost = null;
  let seenProxyHeaders = null;
  const origin = http.createServer((req, res) => {
    seenHost = req.headers.host;
    seenProxyHeaders = Object.keys(req.headers).filter((h) => h.startsWith('proxy-'));
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end(`hello ${req.url}`);
  });
  const originPort = await listen(origin);
  const proxy = createEgressProxy({ testAllow: new Set([`127.0.0.1:${originPort}`]) });
  const proxyPort = await proxy.listen();

  const res = await viaProxy(proxyPort, `http://127.0.0.1:${originPort}/hello?x=1`);
  assert.equal(res.status, 200);
  assert.equal(res.body, 'hello /hello?x=1');
  assert.equal(seenHost, `127.0.0.1:${originPort}`);
  assert.deepEqual(seenProxyHeaders, [], 'hop-by-hop proxy headers are stripped');
  assert.equal(proxy.stats().blocked, 0);

  await proxy.close();
  await close(origin);
});

test('CONNECT tunnels bytes both ways to an allow-listed origin', async () => {
  const echo = net.createServer((socket) => socket.pipe(socket));
  const echoPort = await listen(echo);
  const proxy = createEgressProxy({ testAllow: new Set([`127.0.0.1:${echoPort}`]) });
  const proxyPort = await proxy.listen();

  const { status, socket } = await connectVia(proxyPort, `127.0.0.1:${echoPort}`);
  assert.equal(status, 200);
  const round = await new Promise((resolve) => {
    socket.on('data', (c) => resolve(c.toString()));
    socket.write('ping');
  });
  assert.equal(round, 'ping');
  socket.destroy();

  await proxy.close();
  await close(echo);
});

test('a non-public address is refused with 403 and a reason header', async () => {
  const blocks = [];
  const proxy = createEgressProxy({ onBlock: (b) => blocks.push(b) });
  const proxyPort = await proxy.listen();

  const res = await viaProxy(proxyPort, 'http://127.0.0.1:80/secret');
  assert.equal(res.status, 403);
  assert.equal(res.headers['x-egress-blocked'], 'address_not_allowed');

  const tunnel = await connectVia(proxyPort, '169.254.169.254:80');
  assert.equal(tunnel.status, 403);

  assert.deepEqual(blocks.map((b) => b.reason), ['address_not_allowed', 'address_not_allowed']);
  assert.equal(proxy.stats().blocked, 2);
  await proxy.close();
});

test('a port outside the allow list is refused', async () => {
  const proxy = createEgressProxy();
  const proxyPort = await proxy.listen();
  const res = await connectVia(proxyPort, 'example.com:22');
  assert.equal(res.status, 403);
  assert.equal(res.headers['x-egress-blocked'], 'port_not_allowed');
  await proxy.close();
});

test('an empty or failing DNS answer is refused', async () => {
  const proxy = createEgressProxy({ lookup: async () => [] });
  const proxyPort = await proxy.listen();
  assert.equal((await connectVia(proxyPort, 'nowhere.invalid:443')).headers['x-egress-blocked'], 'dns_failed');
  await proxy.close();

  const throwing = createEgressProxy({ lookup: async () => { throw new Error('ENOTFOUND'); } });
  const throwingPort = await throwing.listen();
  assert.equal((await connectVia(throwingPort, 'nowhere.invalid:443')).headers['x-egress-blocked'], 'dns_failed');
  await throwing.close();
});

test('a MIXED DNS answer is a rebinding attempt and is refused whole', async () => {
  const proxy = createEgressProxy({
    lookup: async () => ([{ address: '8.8.8.8', family: 4 }, { address: '127.0.0.1', family: 4 }]),
  });
  const proxyPort = await proxy.listen();
  const res = await connectVia(proxyPort, 'rebind.example:443');
  assert.equal(res.status, 403);
  assert.equal(res.headers['x-egress-blocked'], 'address_not_allowed');
  await proxy.close();
});

test('the validated address is connected to, and the name is never resolved twice', async () => {
  const echo = net.createServer((socket) => socket.on('data', () => socket.end('reached')));
  const echoPort = await listen(echo);

  let calls = 0;
  const proxy = createEgressProxy({
    // First answer is the allowed loopback origin; a second lookup would return a different
    // address. Connecting by the validated IP means the second answer is never asked for.
    lookup: async () => { calls += 1; return [{ address: '127.0.0.1', family: 4 }]; },
    testAllow: new Set([`rebind.example:${echoPort}`]),
  });
  const proxyPort = await proxy.listen();

  const { status, socket } = await connectVia(proxyPort, `rebind.example:${echoPort}`);
  assert.equal(status, 200);
  const got = await new Promise((resolve) => {
    socket.on('data', (c) => resolve(c.toString()));
    socket.write('go');
  });
  assert.equal(got, 'reached');
  assert.equal(calls, 1, 'exactly one lookup per connection');
  socket.destroy();

  await proxy.close();
  await close(echo);
});

test('an IP literal is judged directly, with no DNS at all', async () => {
  let calls = 0;
  const proxy = createEgressProxy({ lookup: async () => { calls += 1; return [{ address: '8.8.8.8', family: 4 }]; } });
  const proxyPort = await proxy.listen();
  const res = await connectVia(proxyPort, '10.0.0.5:443');
  assert.equal(res.headers['x-egress-blocked'], 'address_not_allowed');
  assert.equal(calls, 0);
  await proxy.close();
});

test('exclusive mode allows ONLY the test allow list, so fixtures cannot reach the internet', async () => {
  const origin = http.createServer((req, res) => res.end('ok'));
  const originPort = await listen(origin);
  const blocks = [];
  const proxy = createEgressProxy({
    testAllow: new Set([`127.0.0.1:${originPort}`]),
    exclusive: true,
    onBlock: (b) => blocks.push(b),
  });
  const proxyPort = await proxy.listen();

  assert.equal((await viaProxy(proxyPort, `http://127.0.0.1:${originPort}/`)).status, 200);
  // A public host on an allowed port would pass the normal policy. Exclusive mode refuses it.
  const res = await connectVia(proxyPort, 'www.google.com:443');
  assert.equal(res.status, 403);
  assert.equal(res.headers['x-egress-blocked'], 'not_in_test_allow_list');
  assert.deepEqual(blocks.map((b) => b.host), ['www.google.com']);

  await proxy.close();
  await close(origin);
});

test('seal refuses new connections and destroys open ones', async () => {
  const echo = net.createServer((socket) => socket.pipe(socket));
  const echoPort = await listen(echo);
  const proxy = createEgressProxy({ testAllow: new Set([`127.0.0.1:${echoPort}`]) });
  const proxyPort = await proxy.listen();

  const { socket } = await connectVia(proxyPort, `127.0.0.1:${echoPort}`);
  const closed = new Promise((resolve) => socket.on('close', resolve));
  assert.equal(proxy.stats().sealed, false);

  proxy.seal();
  await closed;                                   // the live tunnel is torn down
  assert.equal(proxy.stats().sealed, true);
  assert.equal(proxy.stats().openSockets, 0);

  const after = await connectVia(proxyPort, `127.0.0.1:${echoPort}`).catch((e) => ({ error: e }));
  assert.ok(after.error || after.status === 403, 'nothing connects after the seal');

  await proxy.close();
  await close(echo);
});

test('stats count connections and blocks, and close tears the listener down', async () => {
  const origin = http.createServer((req, res) => res.end('ok'));
  const originPort = await listen(origin);
  const proxy = createEgressProxy({ testAllow: new Set([`127.0.0.1:${originPort}`]) });
  const proxyPort = await proxy.listen();
  assert.equal(proxy.port, proxyPort);

  await viaProxy(proxyPort, `http://127.0.0.1:${originPort}/a`);
  await viaProxy(proxyPort, 'http://10.0.0.1:80/b');
  const stats = proxy.stats();
  assert.equal(stats.connections, 1);
  assert.equal(stats.blocked, 1);

  await proxy.close();
  assert.equal(proxy.port, null);
  await close(origin);
});

test('a request target that is not an absolute URI is refused', async () => {
  const proxy = createEgressProxy();
  const proxyPort = await proxy.listen();
  const res = await new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: proxyPort, path: '/relative' }, (r) => {
      r.resume();
      r.on('end', () => resolve({ status: r.statusCode, headers: r.headers }));
    });
    req.on('error', reject);
    req.end();
  });
  assert.equal(res.status, 403);
  assert.equal(res.headers['x-egress-blocked'], 'not_absolute_uri');
  await proxy.close();
});
