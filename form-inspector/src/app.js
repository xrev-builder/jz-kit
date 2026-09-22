'use strict';

// The HTTP layer (BUILD-SPEC section 14). createApp(config, deps) so tests inject storage,
// a fake inspector and config without touching process.env.

const express = require('express');
const path = require('node:path');
const crypto = require('node:crypto');
const { createAuth } = require('./auth');
const { createLimits } = require('./limits');
const { project, VIEWS } = require('./views');
const { newAuditId } = require('./storage');
const openapi = require('./openapi.json');

const MAX_URL_CHARS = 2000;
const MAX_LABEL_CHARS = 120;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_.:-]{1,128}$/;
const AUDIT_ID = /^aud_[a-z2-7]{20}$/;

const ALLOWED_BODY_KEYS = new Set(['urls', 'label', 'options']);
const ALLOWED_OPTION_KEYS = new Set(['probe', 'consent', 'waitMs', 'clickSelectors']);
// Known but unshipped. Listed in the result contract, so it is a bad_request, not an
// unknown_field. Rejected at the API boundary AND absent from the engine.
const UNSHIPPED_OPTION_KEYS = new Set(['submitCapture']);

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const bad = (code, message, details) => new ApiError(400, code, message, details);

function normalizeUrls(raw) {
  if (!Array.isArray(raw)) throw bad('bad_request', 'urls must be an array of strings');
  if (raw.length === 0) throw bad('bad_request', 'urls must hold at least one URL');
  const seen = new Set();
  const out = [];
  for (const entry of raw) {
    if (typeof entry !== 'string') throw bad('invalid_url', 'every entry of urls must be a string');
    const trimmed = entry.trim();
    if (!trimmed || trimmed.length > MAX_URL_CHARS) {
      throw bad('invalid_url', `a URL is empty or longer than ${MAX_URL_CHARS} characters`);
    }
    let parsed;
    try { parsed = new URL(trimmed); } catch { throw bad('invalid_url', `not a URL: ${trimmed.slice(0, 80)}`); }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw bad('invalid_url', 'only http and https URLs are accepted');
    }
    if (parsed.username || parsed.password) {
      throw bad('invalid_url', 'URLs must not carry credentials');
    }
    parsed.hash = '';
    const normalized = parsed.toString();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

function validateBody(body, maxUrls) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw bad('bad_request', 'the request body must be a JSON object');
  }
  for (const key of Object.keys(body)) {
    if (!ALLOWED_BODY_KEYS.has(key)) {
      throw bad('unknown_field', `unknown field: ${key}`, { field: key });
    }
  }
  const urls = normalizeUrls(body.urls);
  if (urls.length > maxUrls) {
    throw new ApiError(400, 'too_many_urls', `at most ${maxUrls} URLs per audit for this principal`,
      { max: maxUrls, given: urls.length });
  }

  let label = null;
  if (body.label !== undefined && body.label !== null) {
    if (typeof body.label !== 'string' || body.label.length > MAX_LABEL_CHARS) {
      throw bad('bad_request', `label must be a string of at most ${MAX_LABEL_CHARS} characters`);
    }
    label = body.label;
  }

  const raw = body.options === undefined || body.options === null ? {} : body.options;
  if (typeof raw !== 'object' || Array.isArray(raw)) throw bad('bad_request', 'options must be an object');
  for (const key of Object.keys(raw)) {
    if (UNSHIPPED_OPTION_KEYS.has(key)) {
      throw bad('bad_request', `options.${key} is not available in this version`, { field: key });
    }
    if (!ALLOWED_OPTION_KEYS.has(key)) throw bad('unknown_field', `unknown field: options.${key}`, { field: key });
  }

  const options = { probe: true, consent: 'accept', waitMs: 2500, clickSelectors: [] };
  if (raw.probe !== undefined) {
    if (typeof raw.probe !== 'boolean') throw bad('bad_request', 'options.probe must be a boolean');
    options.probe = raw.probe;
  }
  if (raw.consent !== undefined) {
    if (raw.consent !== 'accept' && raw.consent !== 'ignore') {
      throw bad('bad_request', "options.consent must be 'accept' or 'ignore'");
    }
    options.consent = raw.consent;
  }
  if (raw.waitMs !== undefined) {
    if (typeof raw.waitMs !== 'number' || !Number.isFinite(raw.waitMs)) {
      throw bad('bad_request', 'options.waitMs must be a number');
    }
    options.waitMs = Math.min(Math.max(Math.round(raw.waitMs), 0), 10000);
  }
  if (raw.clickSelectors !== undefined) {
    if (!Array.isArray(raw.clickSelectors) || raw.clickSelectors.length > 5) {
      throw bad('bad_request', 'options.clickSelectors must be an array of at most 5 strings');
    }
    for (const selector of raw.clickSelectors) {
      if (typeof selector !== 'string' || selector.length > 200) {
        throw bad('bad_request', 'each clickSelector must be a string of at most 200 characters');
      }
    }
    options.clickSelectors = [...raw.clickSelectors];
  }
  return { urls, label, options };
}

const encodeCursor = (cursor) => Buffer.from(JSON.stringify(cursor)).toString('base64url');
function decodeCursor(text) {
  if (text === undefined) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(text), 'base64url').toString('utf8'));
    if (parsed && typeof parsed.createdAt === 'string' && typeof parsed.id === 'string') return parsed;
  } catch { /* fall through */ }
  throw bad('bad_request', 'cursor is not a cursor this service issued');
}

function parseLimit(raw, max, fallback) {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw bad('bad_request', `limit must be an integer between 1 and ${max}`);
  }
  return value;
}

function bodyHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function createApp(config, deps) {
  const { storage, queue, browserManager, now = () => new Date(), version = '0.1.0', startedAt = Date.now() } = deps;
  const auth = createAuth(config);
  const limits = createLimits({ storage, config, now });
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', false);   // the client IP is resolved by auth.clientIp, not express

  // Strict headers on every response. No CORS headers are ever sent.
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy',
      "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
      "connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (req.path.startsWith('/api') || req.path.startsWith('/ui')) {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  });

  app.use(express.json({ limit: config.limits.maxRequestBytes }));

  const fail = (res, error) => {
    const status = error.status || 500;
    const payload = {
      error: {
        code: error.code || 'internal',
        message: error.status ? error.message : 'the service failed to handle this request',
      },
    };
    if (error.details) payload.error.details = error.details;
    if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter));
    res.status(status).json(payload);
  };

  function requirePrincipal(req) {
    const principal = auth.authenticate(req);
    if (!principal) throw new ApiError(401, 'unauthorized', 'a valid API key or UI session is required');
    return principal;
  }

  function requireCsrf(req, principal) {
    if (principal.kind !== 'ui') return;
    if (!auth.csrfOk(req)) {
      throw new ApiError(403, 'csrf_required', 'cookie-authenticated writes must carry X-FI-CSRF: 1 and a same-host Origin');
    }
  }

  // ---- public routes ------------------------------------------------------------

  app.get('/api/v1/health', (req, res) => {
    const status = browserManager ? browserManager.status() : { state: 'idle', sandbox: null };
    res.json({
      status: 'ok',
      version,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      browser: { state: status.state, sandbox: status.sandbox },
      queue: { activeInspections: queue ? queue.stats().activeAudits : 0,
        queuedAudits: queue ? queue.stats().queuedAudits : 0 },
    });
  });

  app.get('/api/v1/openapi.json', (req, res) => res.json(openapi));

  app.get('/ui/session', (req, res) => {
    const principal = auth.authenticate(req);
    res.json({
      authenticated: !!principal && principal.kind === 'ui',
      uiEnabled: config.uiEnabled,
      maxUrls: config.limits.uiMaxUrls,
    });
  });

  app.post('/ui/login', async (req, res) => {
    const clientIp = auth.clientIp(req);
    // A constant one second answer delay, whatever the outcome.
    const answer = (fn) => setTimeout(fn, 1000);
    if (!config.uiEnabled) {
      answer(() => fail(res, new ApiError(401, 'unauthorized', 'the web UI is not enabled')));
      return;
    }
    if (!limits.loginAllowed(clientIp)) {
      answer(() => fail(res, Object.assign(
        new ApiError(429, 'rate_limited', 'too many sign-in attempts'), { retryAfter: 60 })));
      return;
    }
    const passcode = req.body && req.body.passcode;
    if (typeof passcode !== 'string') {
      answer(() => fail(res, bad('bad_request', 'passcode must be a string')));
      return;
    }
    if (!auth.passcodeOk(passcode)) {
      answer(() => fail(res, new ApiError(401, 'unauthorized', 'that passcode is not valid')));
      return;
    }
    answer(() => {
      limits.resetLogin(clientIp);
      res.setHeader('Set-Cookie',
        `${auth.cookieName}=${auth.issueSession()}; ${auth.cookieAttributes(config.sessionHours * 3600)}`);
      res.status(204).end();
    });
  });

  app.post('/ui/logout', (req, res) => {
    // A __Host- cookie is expired by re-setting it with identical attributes.
    res.setHeader('Set-Cookie', `${auth.cookieName}=; ${auth.cookieAttributes(0)}`);
    res.status(204).end();
  });

  // ---- audits -------------------------------------------------------------------

  app.post('/api/v1/audits', (req, res) => {
    try {
      const principal = requirePrincipal(req);
      requireCsrf(req, principal);
      const clientIp = auth.clientIp(req);
      const maxUrls = limits.caps(principal).maxUrls;
      const { urls, label, options } = validateBody(req.body, maxUrls);

      const idempotencyKey = req.headers['idempotency-key'];
      if (idempotencyKey !== undefined && !IDEMPOTENCY_KEY.test(String(idempotencyKey))) {
        throw bad('bad_request', 'Idempotency-Key must be 1 to 128 characters of [A-Za-z0-9_.:-]');
      }
      const hash = bodyHash({ urls, label, options });

      // Admission, in order, with no await between the first check and the insert.
      const audit = storage.transaction(() => {
        if (idempotencyKey) {
          const existing = storage.getIdempotency(principal.id, String(idempotencyKey));
          if (existing) {
            if (existing.body_hash !== hash) {
              throw new ApiError(409, 'idempotency_conflict',
                'that Idempotency-Key was used with a different body');
            }
            return { replay: true, audit: storage.getAudit(existing.audit_id) };
          }
        }
        if (storage.countQueued() >= config.limits.maxQueuedAudits) {
          throw Object.assign(new ApiError(429, 'queue_full', 'the queue is full, try again shortly'),
            { retryAfter: 60 });
        }
        const reservation = limits.reserve({ principal, clientIp, urls: urls.length });
        if (!reservation.ok) {
          throw Object.assign(
            new ApiError(429, reservation.code,
              reservation.scope === 'global'
                ? 'the instance page budget for today is spent'
                : 'this principal has used its hourly allowance'),
            { details: { scope: reservation.scope }, retryAfter: reservation.retryAfter },
          );
        }

        const at = now().toISOString();
        const expiresAt = new Date(now().getTime() + config.retentionDays * 86_400_000).toISOString();
        const created = storage.createAudit({
          id: newAuditId(), label, status: 'queued', urls, options,
          totalPages: urls.length, createdBy: principal.id, createdAt: at, expiresAt,
        });
        if (idempotencyKey) storage.putIdempotency(principal.id, String(idempotencyKey), hash, created.id, at);
        return { replay: false, audit: created };
      });

      if (audit.replay) {
        res.setHeader('Idempotent-Replay', 'true');
        res.status(200).json({ audit: audit.audit });
        return;
      }
      if (queue) queue.enqueue(audit.audit.id);
      res.status(202).json({ audit: audit.audit });
    } catch (error) { fail(res, error); }
  });

  app.get('/api/v1/audits', (req, res) => {
    try {
      requirePrincipal(req);
      const limit = parseLimit(req.query.limit, 50, 20);
      const cursor = decodeCursor(req.query.cursor);
      const label = req.query.label === undefined ? null : String(req.query.label);
      const page = storage.listAudits({ limit, cursor, label });
      res.json({ audits: page.audits, nextCursor: page.nextCursor ? encodeCursor(page.nextCursor) : null });
    } catch (error) { fail(res, error); }
  });

  app.get('/api/v1/audits/:id', (req, res) => {
    try {
      requirePrincipal(req);
      if (!AUDIT_ID.test(req.params.id)) throw new ApiError(404, 'not_found', 'no such audit');
      const audit = storage.getAudit(req.params.id);
      if (!audit) throw new ApiError(404, 'not_found', 'no such audit');
      res.json({ audit });
    } catch (error) { fail(res, error); }
  });

  app.get('/api/v1/audits/:id/pages', (req, res) => {
    try {
      requirePrincipal(req);
      if (!AUDIT_ID.test(req.params.id)) throw new ApiError(404, 'not_found', 'no such audit');
      const audit = storage.getAudit(req.params.id);
      if (!audit) throw new ApiError(404, 'not_found', 'no such audit');

      const view = req.query.view === undefined ? 'hidden' : String(req.query.view);
      if (!VIEWS.includes(view)) throw bad('bad_request', `view must be one of ${VIEWS.join(', ')}`);
      const maxLimit = view === 'full' ? 5 : 50;
      const limit = parseLimit(req.query.limit, maxLimit, Math.min(20, maxLimit));
      const offset = req.query.cursor === undefined ? 0 : Number(req.query.cursor);
      if (!Number.isInteger(offset) || offset < 0) throw bad('bad_request', 'cursor is not a cursor this service issued');

      const page = storage.getPages(req.params.id, { limit, offset });
      res.json({
        pages: page.pages.map((entry) => ({
          position: entry.position, url: entry.url, view, result: project(entry.result, view),
        })),
        nextCursor: page.nextCursor,
      });
    } catch (error) { fail(res, error); }
  });

  app.delete('/api/v1/audits/:id', (req, res) => {
    try {
      const principal = requirePrincipal(req);
      requireCsrf(req, principal);
      if (!AUDIT_ID.test(req.params.id)) throw new ApiError(404, 'not_found', 'no such audit');
      const audit = storage.getAudit(req.params.id);
      if (!audit) throw new ApiError(404, 'not_found', 'no such audit');
      if (audit.status === 'queued' || audit.status === 'running') {
        throw new ApiError(409, 'audit_active', 'this audit is still running');
      }
      storage.deleteAudit(req.params.id);
      res.status(204).end();
    } catch (error) { fail(res, error); }
  });

  // ---- web UI --------------------------------------------------------------------

  if (config.uiEnabled) {
    app.use(express.static(path.join(__dirname, '..', 'public'), {
      index: 'index.html', maxAge: 0, setHeaders: (res) => res.setHeader('Cache-Control', 'no-store'),
    }));
  }

  app.use((req, res) => fail(res, new ApiError(404, 'not_found', 'no such endpoint')));

  // Express error handler, including the JSON body-size refusal.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error && (error.type === 'entity.too.large' || error.status === 413)) {
      fail(res, new ApiError(413, 'payload_too_large', 'the request body is larger than 64 KB'));
      return;
    }
    if (error && error.type === 'entity.parse.failed') {
      fail(res, bad('bad_request', 'the request body is not valid JSON'));
      return;
    }
    fail(res, error instanceof ApiError ? error : new ApiError(500, 'internal', 'internal error'));
  });

  return app;
}

module.exports = { createApp, ApiError, normalizeUrls, validateBody, encodeCursor, decodeCursor };
