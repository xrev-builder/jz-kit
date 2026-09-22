'use strict';

// Bearer keys, the UI session cookie, CSRF and the trusted client IP (BUILD-SPEC 14.1, 14.4).

const crypto = require('node:crypto');
const net = require('node:net');

const SESSION_COOKIE_SECURE = '__Host-fi_session';
const SESSION_COOKIE_PLAIN = 'fi_session';

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

// Constant-time compare on digests, so the comparison never depends on secret length.
function secretsEqual(a, b) {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function buildBlockList(cidrs) {
  const list = new net.BlockList();
  for (const entry of cidrs) {
    const [addr, prefix] = entry.split('/');
    const family = net.isIPv6(addr) ? 'ipv6' : 'ipv4';
    if (prefix === undefined) list.addAddress(addr, family);
    else list.addSubnet(addr, Number(prefix), family);
  }
  return list;
}

function createAuth(config) {
  const sessionSecret = config.sessionSecret || crypto.randomBytes(32).toString('hex');
  const cookieName = config.cookieSecure ? SESSION_COOKIE_SECURE : SESSION_COOKIE_PLAIN;
  const trusted = buildBlockList(config.trustedProxyCidrs || []);

  function sign(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const mac = crypto.createHmac('sha256', sessionSecret).update(body).digest('base64url');
    return `${body}.${mac}`;
  }

  function verify(token) {
    if (typeof token !== 'string') return null;
    const dot = token.lastIndexOf('.');
    if (dot <= 0) return null;
    const body = token.slice(0, dot);
    const mac = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', sessionSecret).update(body).digest('base64url');
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }

  // The header counts ONLY when the socket peer is inside the trusted networks, so a forged
  // header from an untrusted peer is ignored.
  function clientIp(req) {
    const peer = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '';
    const bare = peer.startsWith('::ffff:') ? peer.slice(7) : peer;
    let peerTrusted = false;
    try {
      peerTrusted = !!bare && trusted.check(bare, net.isIPv6(bare) ? 'ipv6' : 'ipv4');
    } catch { peerTrusted = false; }
    if (!peerTrusted) return bare || 'unknown';
    const forwarded = req.headers[config.clientIpHeader];
    if (typeof forwarded === 'string' && net.isIP(forwarded.trim())) return forwarded.trim();
    return bare || 'unknown';
  }

  function authenticate(req) {
    const header = req.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      const presented = header.slice(7).trim();
      for (const key of config.apiKeys) {
        if (secretsEqual(presented, key.secret)) {
          return { kind: 'key', id: `key:${key.name}`, name: key.name };
        }
      }
      return null;
    }
    const cookies = parseCookies(req.headers.cookie);
    const session = verify(cookies[cookieName]);
    if (session) return { kind: 'ui', id: 'ui' };
    return null;
  }

  // Cookie-authenticated state changes must carry the CSRF header, and an Origin header, when
  // present, must equal the request host. No CORS headers are ever sent.
  function csrfOk(req) {
    if (req.headers['x-fi-csrf'] !== '1') return false;
    const origin = req.headers.origin;
    if (origin) {
      try {
        if (new URL(origin).host !== req.headers.host) return false;
      } catch { return false; }
    }
    return true;
  }

  return {
    cookieName,
    authenticate,
    csrfOk,
    clientIp,
    passcodeOk(presented) {
      if (!config.uiPasscode || typeof presented !== 'string') return false;
      return secretsEqual(presented, config.uiPasscode);
    },
    issueSession() {
      return sign({ sub: 'ui', exp: Date.now() + config.sessionHours * 3600 * 1000 });
    },
    cookieAttributes(maxAgeSeconds) {
      const parts = [`Path=/`, 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`];
      if (config.cookieSecure) parts.push('Secure');
      return parts.join('; ');
    },
    verify,
  };
}

module.exports = { createAuth, parseCookies, SESSION_COOKIE_SECURE, SESSION_COOKIE_PLAIN };
