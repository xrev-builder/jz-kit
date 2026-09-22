'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { loadConfig } = require('../../src/config');
const { createStorage } = require('../../src/storage');
const { createQueue } = require('../../src/queue');
const { createApp } = require('../../src/app');
const openapi = require('../../src/openapi.json');

const KEY = 'test-key-0123456789abcdef';
const PASSCODE = 'passcode-123';

function fakeResult(url, over = {}) {
  return {
    schemaVersion: 1, requestedUrl: url, finalUrl: url, outcome: 'ok', outcomeReason: null,
    outcomeDetail: null, httpStatus: 200,
    scope: { consentMode: 'accept', consentBannerDetected: false, consentClicked: null, probe: true, clickSelectors: [], note: 'n' },
    runs: { baseline: { url, errors: [] }, probe: null },
    providers: [{ provider: 'hubspot', confidence: 'medium', evidence: ['host'] }],
    enrichmentVendors: [], cookies: [{ name: 'c', domain: 'd', containsSentinel: null }],
    forms: [{
      formIndex: 0, frame: { url, isMainFrame: true, crossOrigin: false, depth: 0, paramsForwardedToFrame: null },
      inShadowDom: false, pseudoForm: false, selector: 'form#a',
      attrs: { id: 'a', name: null, className: null, action: '/x?secret=1', method: 'post', role: null },
      provider: { provider: 'hubspot', confidence: 'high', evidence: [] }, providerFormId: 'g',
      kind: 'lead', kindReason: 'email', visible: true, probeMatched: true,
      fields: [
        { source: 'dom', tag: 'input', type: 'hidden', name: 'utm_source', id: null, label: null,
          leakedName: null, required: false, hiddenKind: 'type_hidden', hiddenBy: 'self', noise: null,
          baselineValue: '', probeValue: 'fitest-utm-source', valueTruncated: false,
          population: 'url_param', populatedFrom: 'utm_source', populatedKeys: ['utm_source'],
          populationEvidence: 'load', probeOnly: false, payloadValue: null, matchedKey: 'utm_source', definitionInfo: null },
        { source: 'dom', tag: 'input', type: 'email', name: 'email', id: null, label: null,
          leakedName: null, required: true, hiddenKind: null, hiddenBy: null, noise: null,
          baselineValue: null, probeValue: null, valueTruncated: false, population: 'unknown',
          populatedFrom: null, populatedKeys: [], populationEvidence: null, probeOnly: false,
          payloadValue: null, matchedKey: null, definitionInfo: null },
        { source: 'dom', tag: 'input', type: 'hidden', name: 'csrf', id: null, label: null,
          leakedName: null, required: false, hiddenKind: 'type_hidden', hiddenBy: 'self', noise: 'csrf',
          baselineValue: 'abc', probeValue: 'def', valueTruncated: false, population: 'dynamic',
          populatedFrom: null, populatedKeys: [], populationEvidence: null, probeOnly: false,
          payloadValue: null, matchedKey: null, definitionInfo: null },
      ],
      definition: null,
      coverage: { utm_source: 'captured', utm_medium: 'not_observed', utm_campaign: 'not_observed',
        utm_term: 'not_observed', utm_content: 'not_observed', gclid: 'not_observed', gbraid: 'not_observed',
        wbraid: 'not_observed', msclkid: 'not_observed', fbclid: 'not_observed', li_fat_id: 'not_observed', ttclid: 'not_observed' },
      counts: { fields: 3, typeHidden: 1, cssHidden: 0, offscreen: 0, sectionHidden: 0, noise: 1 },
      truncated: false,
    }],
    stack: { edgeCdn: [{ name: 'Cloudflare', confidence: 'high', evidence: ['cf-ray'] }], assetCdn: [],
      hosting: [], server: [], cms: [], frameworks: [], tagManagers: [], analytics: [], advertising: [],
      marketing: [], chat: [], consent: [], security: [], observed: { headers: {}, headerFlags: [], fromLoad: 'baseline' } },
    unmatchedDefinitions: [],
    findings: [{ id: 'UTM_COVERAGE', severity: 'info', formIndex: 0, title: 'ok', detail: 'd', evidence: {} }],
    limits: { truncated: false, notes: [] }, timings: { totalMs: 1 },
    inspectedAt: new Date().toISOString(), inspectorVersion: '0.1.0',
    ...over,
  };
}

function build(envOver = {}, { inspectImpl } = {}) {
  const config = loadConfig({
    NODE_ENV: 'test', FI_API_KEYS: `main:${KEY}`, FI_UI_PASSCODE: PASSCODE,
    FI_SESSION_SECRET: 'unit-test-secret', FI_COOKIE_SECURE: '0',
    ...envOver,
  });
  const storage = createStorage();
  const inspector = { inspect: inspectImpl || (async (url) => fakeResult(url)) };
  const queue = createQueue({ storage, inspector, config, log: () => {} });
  const app = createApp(config, { storage, queue, browserManager: null, version: '0.1.0' });
  // Teardown: stop the queue and let in-flight audits finish before the handle closes.
  const shutdown = async () => {
    queue.stop();
    await queue.drain(3000);
    storage.close();
  };
  return { config, storage, queue, app, shutdown };
}

async function serve(app) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, { body, headers = {} } = {}) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
      body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
    return { status: res.status, headers: res.headers, json, text };
  };
  return { call, close: () => new Promise((resolve) => server.close(resolve)) };
}

const AUTH = { authorization: `Bearer ${KEY}` };

async function settle(storage, auditId, tries = 200) {
  for (let i = 0; i < tries; i++) {
    const audit = storage.getAudit(auditId);
    if (audit && (audit.status === 'complete' || audit.status === 'failed')) return audit;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error('the audit never reached a terminal state');
}

// ---- boot and public surface -------------------------------------------------------

test('the process refuses to start without a credential', () => {
  assert.throws(() => loadConfig({}), /refusing to start without a credential/);
  assert.doesNotThrow(() => loadConfig({ FI_UI_PASSCODE: 'longenough' }));
  assert.doesNotThrow(() => loadConfig({ FI_API_KEYS: `a:${KEY}` }));
  assert.throws(() => loadConfig({ FI_API_KEYS: 'a:tooshort' }), /shorter than 16/);
  assert.throws(() => loadConfig({ FI_UI_PASSCODE: 'short' }), /at least 8/);
});

test('the test allow list is ignored outside test mode', () => {
  const warnings = [];
  const production = loadConfig(
    { FI_API_KEYS: `a:${KEY}`, FORM_INSPECTOR_TEST_ALLOW: '127.0.0.1:4101' },
    { log: (entry) => warnings.push(entry.event) },
  );
  assert.equal(production.testAllow.size, 0);
  assert.equal(production.egressExclusive, false);
  assert.ok(warnings.includes('test_allow_ignored'));

  const testing = loadConfig({ NODE_ENV: 'test', FI_API_KEYS: `a:${KEY}`, FORM_INSPECTOR_TEST_ALLOW: '127.0.0.1:4101' });
  assert.deepEqual([...testing.testAllow], ['127.0.0.1:4101']);
  assert.equal(testing.egressExclusive, true);
});

test('health and openapi are public, everything else is not', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    assert.equal((await call('GET', '/api/v1/health')).status, 200);
    assert.equal((await call('GET', '/api/v1/openapi.json')).status, 200);
    assert.equal((await call('GET', '/ui/session')).status, 200);
    for (const [method, path] of [['GET', '/api/v1/audits'], ['POST', '/api/v1/audits'],
      ['GET', '/api/v1/audits/aud_aaaaaaaaaaaaaaaaaaaa'], ['DELETE', '/api/v1/audits/aud_aaaaaaaaaaaaaaaaaaaa'],
      ['GET', '/api/v1/audits/aud_aaaaaaaaaaaaaaaaaaaa/pages']]) {
      const res = await call(method, path, { body: method === 'POST' ? { urls: ['https://e.com'] } : undefined });
      assert.equal(res.status, 401, `${method} ${path}`);
      assert.equal(res.json.error.code, 'unauthorized');
    }
  } finally { await close(); await shutdown(); }
});

test('security headers are on every response and no CORS header is ever sent', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    const res = await call('GET', '/api/v1/health');
    assert.match(res.headers.get('content-security-policy'), /default-src 'none'/);
    assert.match(res.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(res.headers.get('cross-origin-opener-policy'), 'same-origin');
    assert.equal(res.headers.get('cross-origin-resource-policy'), 'same-origin');
    assert.equal(res.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  } finally { await close(); await shutdown(); }
});

test('the OpenAPI document names exactly the shipped routes', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    const documented = new Set();
    for (const [p, methods] of Object.entries(openapi.paths)) {
      for (const method of Object.keys(methods)) documented.add(`${method.toUpperCase()} /api/v1${p}`);
    }
    for (const [p, methods] of Object.entries(openapi['x-ui-paths'])) {
      for (const method of Object.keys(methods)) documented.add(`${method.toUpperCase()} ${p}`);
    }

    const shipped = new Set();
    // eslint-disable-next-line no-underscore-dangle
    for (const layer of app._router.stack) {
      if (!layer.route) continue;
      for (const method of Object.keys(layer.route.methods)) {
        shipped.add(`${method.toUpperCase()} ${layer.route.path.replace(/:(\w+)/g, '{$1}')}`);
      }
    }
    assert.deepEqual([...shipped].sort(), [...documented].sort());

    // And the document the service serves is the same one.
    const served = await call('GET', '/api/v1/openapi.json');
    assert.deepEqual(Object.keys(served.json.paths).sort(), Object.keys(openapi.paths).sort());
  } finally { await close(); await shutdown(); }
});

// ---- create, run, read ---------------------------------------------------------------

test('create, run and read in all three views', async () => {
  const { app, storage, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    const created = await call('POST', '/api/v1/audits',
      { body: { urls: ['https://e.com/a', 'https://e.com/b'], label: 'weekly' }, headers: AUTH });
    assert.equal(created.status, 202);
    assert.match(created.json.audit.id, /^aud_[a-z2-7]{20}$/);
    assert.equal(created.json.audit.status, 'queued');
    assert.equal(created.json.audit.createdBy, 'key:main');
    assert.equal(created.json.audit.totalPages, 2);

    const audit = await settle(storage, created.json.audit.id);
    assert.equal(audit.status, 'complete');
    assert.equal(audit.pagesProcessed, 2);
    assert.equal(audit.formsFound, 2);
    assert.equal(audit.hiddenFieldsFound, 2);
    assert.equal(audit.summary.outcomes.ok, 2);
    assert.equal(audit.summary.providers.hubspot, 2);
    assert.equal(audit.summary.edgeCdn.Cloudflare, 2);
    assert.equal(audit.summary.coverage.utm_source.captured, 2);
    assert.equal(audit.summary.findings.info, 2);

    const summary = await call('GET', `/api/v1/audits/${audit.id}/pages?view=summary`, { headers: AUTH });
    assert.equal(summary.status, 200);
    assert.equal(summary.json.pages[0].view, 'summary');
    assert.equal(summary.json.pages[0].result.forms[0].fields, undefined, 'summary carries no fields');
    assert.ok(summary.json.pages[0].result.stack);

    const hidden = await call('GET', `/api/v1/audits/${audit.id}/pages`, { headers: AUTH });
    const form = hidden.json.pages[0].result.forms[0];
    assert.equal(hidden.json.pages[0].view, 'hidden', 'hidden is the default view');
    assert.deepEqual(form.fields.map((f) => f.name), ['utm_source', 'csrf'],
      'hidden fields and noise only, no irrelevant visible field');
    assert.deepEqual(form.fields[1], { name: 'csrf', noise: 'csrf' }, 'noise is listed by name only');
    assert.equal(form.attrs.action, '/x', 'query strings are dropped from actions');

    const full = await call('GET', `/api/v1/audits/${audit.id}/pages?view=full`, { headers: AUTH });
    assert.equal(full.json.pages[0].result.forms[0].fields.length, 3, 'full is the stored result');
  } finally { await close(); await shutdown(); }
});

test('validation, unknown fields and the unshipped submitCapture option', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  const post = (body) => call('POST', '/api/v1/audits', { body, headers: AUTH });
  try {
    assert.equal((await post({ urls: [] })).json.error.code, 'bad_request');
    assert.equal((await post({ urls: 'https://e.com' })).json.error.code, 'bad_request');
    assert.equal((await post({ urls: ['ftp://e.com'] })).json.error.code, 'invalid_url');
    assert.equal((await post({ urls: ['https://user:pw@e.com'] })).json.error.code, 'invalid_url');
    assert.equal((await post({ urls: ['not a url'] })).json.error.code, 'invalid_url');
    assert.equal((await post({ urls: [`https://e.com/${'x'.repeat(2100)}`] })).json.error.code, 'invalid_url');
    assert.equal((await post({ urls: new Array(51).fill(0).map((_, i) => `https://e.com/${i}`) })).json.error.code, 'too_many_urls');

    assert.equal((await post({ urls: ['https://e.com'], webhookUrl: 'https://x' })).json.error.code, 'unknown_field');
    assert.equal((await post({ urls: ['https://e.com'], options: { nope: 1 } })).json.error.code, 'unknown_field');

    // Listed in the result contract but not shipped, so it is a bad_request, not unknown_field.
    const submit = await post({ urls: ['https://e.com'], options: { submitCapture: { formIndex: 0 } } });
    assert.equal(submit.status, 400);
    assert.equal(submit.json.error.code, 'bad_request');
    assert.match(submit.json.error.message, /not available in this version/);

    assert.equal((await post({ urls: ['https://e.com'], options: { consent: 'maybe' } })).json.error.code, 'bad_request');
    assert.equal((await post({ urls: ['https://e.com'], options: { clickSelectors: new Array(6).fill('a') } })).json.error.code, 'bad_request');
    assert.equal((await post({ urls: ['https://e.com'], label: 'x'.repeat(200) })).json.error.code, 'bad_request');

    // waitMs is clamped, not refused.
    const clamped = await post({ urls: ['https://e.com'], options: { waitMs: 99999 } });
    assert.equal(clamped.status, 202);
    assert.equal(clamped.json.audit.options.waitMs, 10000);

    // Duplicates are removed with order kept, and the hash is dropped.
    const deduped = await post({ urls: ['https://e.com/a#one', 'https://e.com/b', 'https://e.com/a'] });
    assert.deepEqual(deduped.json.audit.urls, ['https://e.com/a', 'https://e.com/b']);
  } finally { await close(); await shutdown(); }
});

test('a body over 64 KB is refused with payload_too_large', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    const res = await call('POST', '/api/v1/audits', {
      body: JSON.stringify({ urls: ['https://e.com'], label: 'x'.repeat(70000) }),
      headers: { ...AUTH, 'content-type': 'application/json' },
    });
    assert.equal(res.status, 413);
    assert.equal(res.json.error.code, 'payload_too_large');
  } finally { await close(); await shutdown(); }
});

test('idempotent replay consumes no quota, and a different body conflicts', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  const headers = { ...AUTH, 'idempotency-key': 'abc-123' };
  try {
    const first = await call('POST', '/api/v1/audits', { body: { urls: ['https://e.com'] }, headers });
    assert.equal(first.status, 202);

    const replay = await call('POST', '/api/v1/audits', { body: { urls: ['https://e.com'] }, headers });
    assert.equal(replay.status, 200);
    assert.equal(replay.headers.get('idempotent-replay'), 'true');
    assert.equal(replay.json.audit.id, first.json.audit.id);

    const conflict = await call('POST', '/api/v1/audits', { body: { urls: ['https://other.com'] }, headers });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.json.error.code, 'idempotency_conflict');

    const bad = await call('POST', '/api/v1/audits',
      { body: { urls: ['https://e.com'] }, headers: { ...AUTH, 'idempotency-key': 'has spaces!' } });
    assert.equal(bad.status, 400);
  } finally { await close(); await shutdown(); }
});

test('the hourly URL allowance is reserved for the WHOLE url count', async () => {
  const { app, shutdown } = build({ FI_KEY_URLS_PER_HOUR: '3', FI_KEY_AUDITS_PER_HOUR: '50' });
  const { call, close } = await serve(app);
  try {
    const ok = await call('POST', '/api/v1/audits', { body: { urls: ['https://a.com', 'https://b.com'] }, headers: AUTH });
    assert.equal(ok.status, 202);
    // Two of three are spent. A two-URL audit must be refused whole, not half admitted.
    const refused = await call('POST', '/api/v1/audits', { body: { urls: ['https://c.com', 'https://d.com'] }, headers: AUTH });
    assert.equal(refused.status, 429);
    assert.equal(refused.json.error.code, 'rate_limited');
    assert.equal(refused.json.error.details.scope, 'principal');
    assert.ok(Number(refused.headers.get('retry-after')) > 0);
    // One more URL still fits.
    assert.equal((await call('POST', '/api/v1/audits', { body: { urls: ['https://e.com'] }, headers: AUTH })).status, 202);
  } finally { await close(); await shutdown(); }
});

test('the global daily budget is read from the ledger, so deleting audits never refunds it', async () => {
  const { app, storage, shutdown } = build({ FI_GLOBAL_URLS_PER_DAY: '2' });
  const { call, close } = await serve(app);
  try {
    const first = await call('POST', '/api/v1/audits', { body: { urls: ['https://a.com', 'https://b.com'] }, headers: AUTH });
    assert.equal(first.status, 202);
    await settle(storage, first.json.audit.id);

    const refused = await call('POST', '/api/v1/audits', { body: { urls: ['https://c.com'] }, headers: AUTH });
    assert.equal(refused.status, 429);
    assert.equal(refused.json.error.code, 'quota_exceeded');
    assert.equal(refused.json.error.details.scope, 'global');

    // Delete the finished audit. The budget must NOT reopen.
    assert.equal((await call('DELETE', `/api/v1/audits/${first.json.audit.id}`, { headers: AUTH })).status, 204);
    const stillRefused = await call('POST', '/api/v1/audits', { body: { urls: ['https://c.com'] }, headers: AUTH });
    assert.equal(stillRefused.status, 429);
    assert.equal(stillRefused.json.error.code, 'quota_exceeded');
  } finally { await close(); await shutdown(); }
});

test('the queue refuses work when it is full', async () => {
  const { app, shutdown } = build({ FI_MAX_QUEUED_AUDITS: '1', FI_MAX_ACTIVE_AUDITS: '1' },
    { inspectImpl: () => new Promise(() => {}) });   // never resolves, so the audit stays running
  const { call, close } = await serve(app);
  try {
    assert.equal((await call('POST', '/api/v1/audits', { body: { urls: ['https://a.com'] }, headers: AUTH })).status, 202);
    const full = await call('POST', '/api/v1/audits', { body: { urls: ['https://b.com'] }, headers: AUTH });
    assert.equal(full.status, 429);
    assert.equal(full.json.error.code, 'queue_full');
  } finally { await close(); await shutdown(); }
});

test('one failing page never ends an audit', async () => {
  let call_count = 0;
  const { app, storage, shutdown } = build({}, {
    inspectImpl: async (url) => {
      call_count += 1;
      if (call_count === 1) throw new Error('boom');
      return fakeResult(url);
    },
  });
  const { call, close } = await serve(app);
  try {
    const created = await call('POST', '/api/v1/audits',
      { body: { urls: ['https://a.com', 'https://b.com'] }, headers: AUTH });
    const audit = await settle(storage, created.json.audit.id);
    assert.equal(audit.status, 'complete');
    assert.equal(audit.pagesProcessed, 2);
    assert.equal(audit.summary.outcomes.failed, 1);
    assert.equal(audit.summary.outcomes.ok, 1);
  } finally { await close(); await shutdown(); }
});

test('an audit whose pages all fail is failed', async () => {
  const { app, storage, shutdown } = build({}, { inspectImpl: async () => { throw new Error('boom'); } });
  const { call, close } = await serve(app);
  try {
    const created = await call('POST', '/api/v1/audits', { body: { urls: ['https://a.com'] }, headers: AUTH });
    const audit = await settle(storage, created.json.audit.id);
    assert.equal(audit.status, 'failed');
    assert.equal(audit.error, 'every page failed');
  } finally { await close(); await shutdown(); }
});

test('pagination, the view=full cap and the label filter', async () => {
  const { app, storage, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const res = await call('POST', '/api/v1/audits',
        { body: { urls: [`https://e.com/${i}`], label: i < 2 ? 'batch' : 'other' }, headers: AUTH });
      ids.push(res.json.audit.id);
      await settle(storage, res.json.audit.id);
    }

    const firstPage = await call('GET', '/api/v1/audits?limit=2', { headers: AUTH });
    assert.equal(firstPage.json.audits.length, 2);
    assert.ok(firstPage.json.nextCursor);
    const secondPage = await call('GET', `/api/v1/audits?limit=2&cursor=${encodeURIComponent(firstPage.json.nextCursor)}`, { headers: AUTH });
    assert.equal(secondPage.json.audits.length, 2);
    const seen = [...firstPage.json.audits, ...secondPage.json.audits].map((a) => a.id);
    assert.equal(new Set(seen).size, 4, 'pages do not overlap');

    const filtered = await call('GET', '/api/v1/audits?label=batch', { headers: AUTH });
    assert.equal(filtered.json.audits.length, 2);

    assert.equal((await call('GET', '/api/v1/audits?limit=0', { headers: AUTH })).status, 400);
    assert.equal((await call('GET', '/api/v1/audits?limit=99', { headers: AUTH })).status, 400);
    assert.equal((await call('GET', '/api/v1/audits?cursor=nonsense', { headers: AUTH })).status, 400);

    const capped = await call('GET', `/api/v1/audits/${ids[0]}/pages?view=full&limit=6`, { headers: AUTH });
    assert.equal(capped.status, 400, 'view=full caps the limit at 5');
    assert.equal((await call('GET', `/api/v1/audits/${ids[0]}/pages?view=nope`, { headers: AUTH })).status, 400);
  } finally { await close(); await shutdown(); }
});

test('deleting an active audit is refused with 409', async () => {
  const { app, shutdown } = build({}, { inspectImpl: () => new Promise(() => {}) });
  const { call, close } = await serve(app);
  try {
    const created = await call('POST', '/api/v1/audits', { body: { urls: ['https://a.com'] }, headers: AUTH });
    const res = await call('DELETE', `/api/v1/audits/${created.json.audit.id}`, { headers: AUTH });
    assert.equal(res.status, 409);
    assert.equal(res.json.error.code, 'audit_active');
  } finally { await close(); await shutdown(); }
});

test('an unknown or malformed audit id is a 404, never a 500', async () => {
  const { app, shutdown } = build();
  const { call, close } = await serve(app);
  try {
    for (const id of ['aud_aaaaaaaaaaaaaaaaaaaa', 'nonsense', '../../etc/passwd', 'aud_SHOUTING']) {
      const res = await call('GET', `/api/v1/audits/${encodeURIComponent(id)}`, { headers: AUTH });
      assert.equal(res.status, 404, id);
      assert.equal(res.json.error.code, 'not_found');
    }
  } finally { await close(); await shutdown(); }
});

// ---- UI session -----------------------------------------------------------------------

test('UI login, CSRF, a foreign Origin, the UI url cap, a tampered cookie and logout', async () => {
  const { app, shutdown } = build({ FI_UI_MAX_URLS: '2' });
  const { call, close } = await serve(app);
  try {
    assert.equal((await call('POST', '/ui/login', { body: { passcode: 'wrong' } })).status, 401);

    const login = await call('POST', '/ui/login', { body: { passcode: PASSCODE } });
    assert.equal(login.status, 204);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    assert.match(login.headers.get('set-cookie'), /HttpOnly/);
    assert.match(login.headers.get('set-cookie'), /SameSite=Strict/);

    const session = await call('GET', '/ui/session', { headers: { cookie } });
    assert.equal(session.json.authenticated, true);
    assert.equal(session.json.maxUrls, 2);

    // A cookie-authenticated write without the CSRF header is refused.
    const noCsrf = await call('POST', '/api/v1/audits', { body: { urls: ['https://e.com'] }, headers: { cookie } });
    assert.equal(noCsrf.status, 403);
    assert.equal(noCsrf.json.error.code, 'csrf_required');

    // A foreign Origin is refused even with the header.
    const foreign = await call('POST', '/api/v1/audits',
      { body: { urls: ['https://e.com'] }, headers: { cookie, 'x-fi-csrf': '1', origin: 'https://evil.example' } });
    assert.equal(foreign.status, 403);

    const ok = await call('POST', '/api/v1/audits',
      { body: { urls: ['https://e.com'] }, headers: { cookie, 'x-fi-csrf': '1' } });
    assert.equal(ok.status, 202);
    assert.equal(ok.json.audit.createdBy, 'ui');

    // The UI cap holds server side, for cookie-authenticated API calls too.
    const tooMany = await call('POST', '/api/v1/audits',
      { body: { urls: ['https://a.com', 'https://b.com', 'https://c.com'] }, headers: { cookie, 'x-fi-csrf': '1' } });
    assert.equal(tooMany.status, 400);
    assert.equal(tooMany.json.error.code, 'too_many_urls');

    // A tampered cookie is not a session.
    const tampered = `${cookie.slice(0, -3)}zzz`;
    assert.equal((await call('GET', '/ui/session', { headers: { cookie: tampered } })).json.authenticated, false);
    assert.equal((await call('GET', '/api/v1/audits', { headers: { cookie: tampered } })).status, 401);

    const logout = await call('POST', '/ui/logout', { headers: { cookie, 'x-fi-csrf': '1' } });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  } finally { await close(); await shutdown(); }
});

test('the login throttle holds per client IP', async () => {
  const { app, shutdown } = build({ FI_LOGIN_PER_MINUTE: '2' });
  const { call, close } = await serve(app);
  try {
    assert.equal((await call('POST', '/ui/login', { body: { passcode: 'no' } })).status, 401);
    assert.equal((await call('POST', '/ui/login', { body: { passcode: 'no' } })).status, 401);
    const throttled = await call('POST', '/ui/login', { body: { passcode: PASSCODE } });
    assert.equal(throttled.status, 429);
    assert.equal(throttled.json.error.code, 'rate_limited');
  } finally { await close(); await shutdown(); }
});

test('a spoofed client-IP header from an untrusted peer is ignored', async () => {
  // 127.0.0.1 IS trusted by default, so the header counts here.
  const trusted = build({ FI_UI_AUDITS_PER_HOUR: '1', FI_TRUSTED_PROXY_CIDRS: '127.0.0.0/8' });
  let served = await serve(trusted.app);
  try {
    const login = await served.call('POST', '/ui/login', { body: { passcode: PASSCODE } });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const headers = (ip) => ({ cookie, 'x-fi-csrf': '1', 'cf-connecting-ip': ip });
    assert.equal((await served.call('POST', '/api/v1/audits', { body: { urls: ['https://a.com'] }, headers: headers('9.9.9.1') })).status, 202);
    // A different forwarded IP is a different principal, so it gets its own allowance.
    assert.equal((await served.call('POST', '/api/v1/audits', { body: { urls: ['https://b.com'] }, headers: headers('9.9.9.2') })).status, 202);
    // The same forwarded IP again is over its allowance.
    assert.equal((await served.call('POST', '/api/v1/audits', { body: { urls: ['https://c.com'] }, headers: headers('9.9.9.1') })).status, 429);
  } finally { await served.close(); await trusted.shutdown(); }

  // With loopback NOT trusted, the header is ignored and every request shares the peer's bucket.
  const untrusted = build({ FI_UI_AUDITS_PER_HOUR: '1', FI_TRUSTED_PROXY_CIDRS: '10.0.0.0/8' });
  served = await serve(untrusted.app);
  try {
    const login = await served.call('POST', '/ui/login', { body: { passcode: PASSCODE } });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const headers = (ip) => ({ cookie, 'x-fi-csrf': '1', 'cf-connecting-ip': ip });
    assert.equal((await served.call('POST', '/api/v1/audits', { body: { urls: ['https://a.com'] }, headers: headers('9.9.9.1') })).status, 202);
    const spoofed = await served.call('POST', '/api/v1/audits', { body: { urls: ['https://b.com'] }, headers: headers('9.9.9.2') });
    assert.equal(spoofed.status, 429, 'a forged header from an untrusted peer must not buy a fresh allowance');
  } finally { await served.close(); await untrusted.shutdown(); }
});

// ---- storage lifecycle ------------------------------------------------------------------

test('restart recovery fails everything left in a non-terminal state', () => {
  const storage = createStorage();
  const now = new Date().toISOString();
  const audit = storage.createAudit({ id: 'aud_aaaaaaaaaaaaaaaaaaaa', label: null, status: 'running',
    urls: ['https://e.com'], options: {}, totalPages: 1, createdBy: 'key:a', createdAt: now, expiresAt: now });
  assert.equal(storage.failInterrupted(now), 1);
  const after = storage.getAudit(audit.id);
  assert.equal(after.status, 'failed');
  assert.equal(after.error, 'interrupted by a restart');
  // Terminal states never change.
  assert.equal(storage.failInterrupted(now), 0);
  storage.close();
});

test('retention purges finished audits and old idempotency keys', () => {
  const storage = createStorage();
  const now = new Date();
  const past = new Date(now.getTime() - 86_400_000).toISOString();
  storage.createAudit({ id: 'aud_bbbbbbbbbbbbbbbbbbbb', label: null, status: 'complete',
    urls: ['https://e.com'], options: {}, totalPages: 1, createdBy: 'key:a',
    createdAt: past, expiresAt: past });
  storage.upsertPage('aud_bbbbbbbbbbbbbbbbbbbb', { position: 0, url: 'https://e.com', outcome: 'ok', result: {} });
  storage.putIdempotency('key:a', 'old', 'h', 'aud_bbbbbbbbbbbbbbbbbbbb', new Date(now.getTime() - 90_000_000).toISOString());

  assert.equal(storage.purgeExpired(now.toISOString()), 1);
  assert.equal(storage.getAudit('aud_bbbbbbbbbbbbbbbbbbbb'), undefined);
  assert.equal(storage.getPages('aud_bbbbbbbbbbbbbbbbbbbb').pages.length, 0);
  assert.equal(storage.getIdempotency('key:a', 'old'), null);
  storage.close();
});
