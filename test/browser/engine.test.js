'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserManager } = require('../../lib/browser');
const { inspect } = require('../../lib/inspect');
const fx = require('../fixtures/server');
const { makeBrowserManager, TEST_ALLOW_HOSTS, TEST_LIMITS, field, findingIds, findingFor } = require('./helpers');

const server = fx.createFixtureServer();
let browserManager;

const run = (url, options = {}) =>
  inspect(url, { waitMs: 300, ...options }, { browserManager, testAllowHosts: TEST_ALLOW_HOSTS, limits: TEST_LIMITS });

test.before(async () => {
  await server.start();
  browserManager = makeBrowserManager();
});
test.after(async () => {
  if (browserManager) await browserManager.close();
  await server.stop();
});

// ---- P01 / P17 -----------------------------------------------------------------------

test('P01 plain hidden: Web-to-Lead, population by value, provider context excluded', async () => {
  const result = await run(`${fx.A}/p01`);
  assert.equal(result.outcome, 'ok');
  assert.equal(result.forms.length, 1);
  const form = result.forms[0];
  assert.equal(form.provider.provider, 'salesforce_w2l');
  assert.equal(form.provider.confidence, 'high');
  assert.equal(form.kind, 'lead');
  assert.equal(form.probeMatched, true);

  // Population is detected by sentinel VALUE. The field name is opaque.
  const opaque = field(form, '00N5e00000AbCdE');
  assert.equal(opaque.population, 'url_param');
  assert.equal(opaque.populatedFrom, 'utm_source');
  assert.equal(opaque.matchedKey, null, 'nothing about the name says utm_source');

  assert.equal(field(form, 'lead_source').population, 'constant');
  assert.equal(field(form, 'oid').noise, 'provider_context');
  assert.equal(form.coverage.utm_source, 'captured');
  assert.equal(form.coverage.utm_medium, 'not_observed');

  // A visible field never carries a value, even though this one is prefilled.
  const email = field(form, 'email');
  assert.equal(email.hiddenKind, null);
  assert.equal(email.baselineValue, null);
  assert.equal(email.probeValue, null);

  // A provider_context constant is not reported as a hidden constant.
  const constants = findingFor(result, 'HIDDEN_CONSTANTS');
  assert.deepEqual(constants.evidence.fields.map((f) => f.name), ['lead_source']);
});

test('P17 pre-tagged URL: the baseline strips attribution so a working field is not a constant', async () => {
  const result = await run(`${fx.A}/p17?utm_source=google&x=1`);
  assert.equal(result.outcome, 'ok');
  const baselineUrl = new URL(result.runs.baseline.url);
  assert.equal(baselineUrl.searchParams.has('utm_source'), false);
  assert.equal(baselineUrl.searchParams.get('x'), '1');

  const form = result.forms[0];
  const opaque = field(form, '00N5e00000AbCdE');
  assert.equal(opaque.population, 'url_param', 'NOT constant');
  assert.ok(result.limits.notes.some((n) => n.includes('removed for baseline and replaced for probe')));
});

// ---- P02 hidden classification --------------------------------------------------------

test('P02 css hidden: wrapper, honeypot, section and the custom-control exemption', async () => {
  const result = await run(`${fx.A}/p02`);
  const form = result.forms.find((f) => f.attrs.id === 'css-hidden');

  const utm = field(form, 'q12_utmMedium');
  assert.equal(utm.hiddenKind, 'css_hidden');
  assert.equal(utm.hiddenBy, 'wrapper');
  assert.equal(utm.matchedKey, 'utm_medium');
  assert.equal(form.coverage.utm_medium, 'present_not_populating');
  assert.equal(findingFor(result, 'UTM_COVERAGE').severity, 'gap');

  const honeypot = field(form, 'website');
  assert.equal(honeypot.noise, 'honeypot');
  assert.ok(['offscreen', 'css_hidden'].includes(honeypot.hiddenKind));
  assert.ok(findingIds(result).includes('HONEYPOT_PRESENT'));

  // Fields inside a display:none step container are a section, not a wrapper.
  assert.equal(field(form, 's1').hiddenBy, 'section');
  assert.ok(form.counts.sectionHidden >= 5);

  // A styled checkbox whose native input has opacity 0 is NOT a hidden field.
  assert.equal(field(form, 'agree').hiddenKind, null);
});

// ---- frames ---------------------------------------------------------------------------

test('P03 same-origin iframe', async () => {
  const result = await run(`${fx.A}/p03`);
  const form = result.forms.find((f) => f.attrs.id === 'inner');
  assert.ok(form, 'the form inside the iframe is found');
  assert.equal(form.frame.crossOrigin, false);
  assert.equal(form.frame.depth, 1);
  assert.equal(form.coverage.gclid, 'captured');
});

test('P04 cross-origin iframe with the recorded Pardot form', async () => {
  const result = await run(`${fx.A}/p04`);
  const form = result.forms.find((f) => f.provider.provider === 'pardot');
  assert.ok(form, 'the Pardot form is found in the cross-origin frame');
  assert.equal(form.provider.confidence, 'high');
  assert.equal(form.frame.crossOrigin, true);

  // The real names leak through the wrapper class.
  const leaked = form.fields.map((f) => f.leakedName).filter(Boolean);
  for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    assert.ok(leaked.includes(name), `${name} recovered from the wrapper class`);
  }
  assert.equal(field(form, 'Spam_Filter').noise, 'antispam');
  assert.equal(field(form, 'pi_extra_field').noise, 'honeypot');
  assert.equal(field(form, '_utf8').noise, 'framework_state');

  assert.equal(form.frame.paramsForwardedToFrame, false);
  const crossOrigin = findingFor(result, 'FORM_IN_CROSS_ORIGIN_IFRAME');
  assert.equal(crossOrigin.severity, 'review');
});

test('P05 and P06: open and closed shadow roots are both read', async () => {
  for (const [page, mode] of [['p05', 'open'], ['p06', 'closed']]) {
    const result = await run(`${fx.A}/${page}`);
    const form = result.forms.find((f) => f.attrs.id === 'shadow-form');
    assert.ok(form, `${mode} shadow root form found`);
    assert.equal(form.inShadowDom, true);
    assert.equal(form.coverage.gclid, 'captured', `${mode} shadow root gclid captured`);
  }
});

// ---- providers and definitions ---------------------------------------------------------

test('P07 marketo-like: JSONP descriptor, autofill channel, and names-only JS API', async () => {
  const result = await run(`${fx.A}/p07`, { waitMs: 1200 });
  const form = result.forms.find((f) => f.provider.provider === 'marketo');
  assert.ok(form, 'the Marketo form is found');
  assert.equal(form.providerFormId, '1234');
  assert.ok(form.definition, 'the JSONP descriptor is attached');
  assert.equal(form.definition.parseStatus, 'ok');

  const hidden = field(form, 'utm_campaign__c');
  assert.deepEqual(hidden.definitionInfo.autofill, { channel: 'url', selector: 'utm_campaign' });
  assert.equal(hidden.population, 'url_param');

  // A descriptor field that never rendered is kept, with its provenance.
  const industry = field(form, 'Industry');
  assert.ok(industry);
  assert.notEqual(industry.source, 'dom');

  // The Marketo JS API hands over NAMES only. Its values must never appear anywhere.
  assert.equal(JSON.stringify(result).includes('visible-value-must-not-leak'), false);
});

test('P08 hubspot-like: a definition captured BY CONTENT from a non-HubSpot host', async () => {
  const result = await run(`${fx.A}/p08`, { waitMs: 1200 });
  const form = result.forms.find((f) => f.provider.provider === 'hubspot');
  assert.ok(form, 'the HubSpot form is found');
  assert.ok(form.definition, 'the definition attached by GUID');
  assert.equal(form.definition.providerFormId, fx.HS_GUID);
  assert.ok(form.definition.sourceUrl.includes(`127.0.0.1:${fx.PORT_B}`), 'served from a non-HubSpot host');

  assert.equal(form.coverage.utm_source, 'present_not_populating');
  assert.equal(findingFor(result, 'UTM_COVERAGE').severity, 'gap');
  assert.equal(field(form, 'hs_context').noise, 'provider_context');
  assert.equal(field(form, 'lifecyclestage').population, 'constant');

  // hs_context is listed by its JSON KEYS, never its values.
  const native = findingFor(result, 'NATIVE_TRACKING');
  assert.deepEqual(native.evidence.hsContextKeys.sort(), ['pageName', 'pageUrl']);
  assert.equal(JSON.stringify(native).includes('fixture'), false, 'no hs_context values in the finding');
});

test('P08b two embeds: each definition lands on its own form and nothing is unmatched', async () => {
  const result = await run(`${fx.A}/p08b`, { waitMs: 1200 });
  const forms = result.forms.filter((f) => f.provider.provider === 'hubspot');
  assert.equal(forms.length, 2);
  assert.ok(forms.every((f) => f.definition), 'both forms got a definition');
  assert.notEqual(forms[0].definition.providerFormId, forms[1].definition.providerFormId);
  assert.deepEqual(result.unmatchedDefinitions, []);
});

// ---- behaviour ---------------------------------------------------------------------------

test('P09 lazy: a form injected far down the page is found because the load uses real input', async () => {
  const result = await run(`${fx.A}/p09`, { waitMs: 800 });
  const form = result.forms.find((f) => f.attrs.id === 'lazy');
  assert.ok(form, 'the lazily injected form is found');
  assert.equal(form.coverage.gclid, 'captured');
});

test('P10 consent: accept runs the gated script, ignore records the banner and leaves it', async () => {
  const accepted = await run(`${fx.A}/p10`, { consent: 'accept' });
  assert.equal(accepted.scope.consentBannerDetected, true);
  assert.equal(accepted.scope.consentClicked, '#onetrust-accept-btn-handler');
  assert.equal(accepted.forms[0].coverage.utm_source, 'captured');
  assert.ok(findingIds(accepted).includes('CONSENT_GATED'));

  const ignored = await run(`${fx.A}/p10`, { consent: 'ignore' });
  assert.equal(ignored.scope.consentBannerDetected, true);
  assert.equal(ignored.scope.consentClicked, null);
  assert.equal(ignored.forms[0].coverage.utm_source, 'present_not_populating');
});

test('P11 cookie populate and dynamic values', async () => {
  const result = await run(`${fx.A}/p11`);
  const form = result.forms[0];
  assert.equal(field(form, 'src').population, 'url_param');
  assert.equal(field(form, 'src').populatedFrom, 'utm_source');
  assert.equal(field(form, 'ts').population, 'dynamic');
  assert.equal(field(form, 'csrf_token').noise, 'csrf');
  // The cookie is reported by name only, with which sentinel it held.
  const cookie = result.cookies.find((c) => c.name === 'fi_src');
  assert.ok(cookie);
  assert.equal(cookie.containsSentinel, 'utm_source');
  assert.equal(Object.keys(cookie).sort().join(','), 'containsSentinel,domain,name');
});

test('P13 no forms, P14 bot wall, P15 pseudo-form, P16 embed not rendered', async () => {
  const empty = await run(`${fx.A}/p13`);
  assert.equal(empty.outcome, 'empty');
  assert.equal(empty.outcomeReason, 'no_forms');
  assert.ok(findingIds(empty).includes('NO_FORMS_FOUND'));

  const blocked = await run(`${fx.A}/p14`);
  assert.equal(blocked.outcome, 'blocked');
  assert.equal(blocked.outcomeReason, 'bot_wall');
  assert.ok(findingIds(blocked).includes('PAGE_BLOCKED'));
  assert.equal(blocked.runs.probe, null, 'a blocked baseline skips the probe');

  const pseudo = await run(`${fx.A}/p15`);
  const form = pseudo.forms.find((f) => f.pseudoForm);
  assert.ok(form, 'inputs outside any <form> become a pseudo-form');
  assert.equal(form.coverage.gclid, 'captured');

  const embed = await run(`${fx.A}/p16`);
  assert.ok(findingIds(embed).includes('EMBED_NOT_RENDERED'));
  assert.equal(embed.outcome, 'partial');
  assert.equal(embed.outcomeReason, 'embed_not_rendered');
});

// ---- recorded fixture -------------------------------------------------------------------

test('R01 recorded Gravity Forms: framework state, antispam and the SharpSpring postback', async () => {
  const result = await run(`${fx.A}/r01`);
  const form = result.forms.find((f) => f.provider.provider === 'gravity_forms');
  assert.ok(form, 'the recorded Gravity Forms form is found');
  assert.equal(form.providerFormId, '13');

  const typeHidden = form.fields.filter((f) => f.hiddenKind === 'type_hidden');
  assert.ok(typeHidden.length >= 20, `${typeHidden.length} type=hidden inputs`);

  // partial_entry_id is written with an UNQUOTED type=hidden. A regex misses it, the DOM does not.
  const partial = field(form, 'partial_entry_id');
  assert.equal(partial.hiddenKind, 'type_hidden');
  assert.equal(partial.noise, 'framework_state');
  assert.equal(field(form, 'ak_js').noise, 'antispam');

  // One constant holds a marketing automation postback URL, which names the vendor.
  const constants = findingFor(result, 'HIDDEN_CONSTANTS');
  assert.ok(constants.evidence.fields.some((f) => f.urlHost && f.urlHost.endsWith('marketingautomation.services')));
  assert.ok(result.providers.some((p) => p.provider === 'sharpspring'));
});

// ---- guards -------------------------------------------------------------------------------

test('G01 click guard: a submit selector is rejected and nothing is submitted', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/g01`, { clickSelectors: ['form button[type=submit]', '#open-modal'] });
  assert.ok(result.limits.notes.some((n) => n.includes('clickSelector rejected: inside a form')),
    `notes were ${JSON.stringify(result.limits.notes)}`);
  assert.equal(server.counters.collector, 0, 'the collector saw nothing');
});

test('G02 consent look-alike: a form submit button reading Agree is never clicked', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/g02`);
  assert.equal(result.scope.consentClicked, null);
  assert.equal(server.counters.collector, 0);
});

test('G03 submit guard: submit() and requestSubmit() do nothing, the form is still read', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/g03`, { waitMs: 600 });
  assert.equal(server.counters.collector, 0, 'the collector saw nothing');
  const form = result.forms.find((f) => f.attrs.id === 'auto');
  assert.ok(form, 'the form is still extracted');
  assert.equal(field(form, 'h').baselineValue, 'v');
});

test('G04 guard tampering: a page-set flag, a borrowed native submit and a synthetic event all fail', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/g04`, { waitMs: 600 });
  assert.equal(server.counters.collector, 0,
    `the collector must stay at zero, saw ${JSON.stringify(server.counters.collectorPaths)}`);
  assert.ok(result.forms.find((f) => f.attrs.id === 'tamper'), 'the form is still extracted');
});

// ---- egress -------------------------------------------------------------------------------

test('S04 the forbidden origin is refused before a browser is ever opened', async () => {
  server.resetCounters();
  const result = await inspect(`http://127.0.0.1:${fx.PORT_FORBIDDEN}/landed`, {},
    { browserManager, testAllowHosts: new Set(), limits: TEST_LIMITS });
  assert.equal(result.outcome, 'failed');
  assert.equal(result.outcomeReason, 'address_not_allowed');
  assert.equal(server.counters.forbidden, 0);
});

test('S05 a redirect to the forbidden origin never lands', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/redirect-to-forbidden`);
  assert.equal(server.counters.forbidden, 0, 'the forbidden counter stays at zero');
  assert.ok(['failed', 'empty', 'partial', 'blocked'].includes(result.outcome));
});

test('S06 img, fetch, sendBeacon and WebSocket to the forbidden origin are all blocked', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/s06`, { waitMs: 800 });
  assert.equal(server.counters.forbidden, 0,
    `nothing may reach the forbidden origin, saw ${JSON.stringify(server.counters.forbiddenPaths)}`);
  assert.ok(result.runs.baseline.egressBlocked >= 1,
    `the proxy must have refused at least one connection, counted ${result.runs.baseline.egressBlocked}`);
});

// ---- trust boundary ---------------------------------------------------------------------------

test('TRUST: a page that defeats String.prototype.slice still yields a 200 character name', async () => {
  const result = await run(`${fx.A}/trust-slice`, { waitMs: 500 });
  const form = result.forms.find((f) => f.attrs.id === 'trust');
  assert.ok(form);
  const huge = form.fields.find((f) => f.name && f.name.startsWith('nnn'));
  assert.ok(huge, 'the field survived');
  assert.equal(huge.name.length, 200);
});

test('TRUST: an oversized extraction becomes partial/frame_errors with a small result', async () => {
  const result = await run(`${fx.A}/trust-huge`, { waitMs: 500 });
  assert.equal(result.outcome, 'partial');
  assert.equal(result.outcomeReason, 'frame_errors');
  assert.ok(Buffer.byteLength(JSON.stringify(result)) < 1_500_000);
});

test('TRUST: getters on probed globals never run', async () => {
  server.resetCounters();
  const result = await run(`${fx.A}/trust-getters`, { waitMs: 600 });
  assert.equal(server.counters.collector, 0,
    `a probed getter fired: ${JSON.stringify(server.counters.collectorPaths)}`);
  assert.ok(result.forms.length >= 1);
});

// ---- site stack -------------------------------------------------------------------------------

test('ST stack provenance: the committed document decides, hops and subframes do not', async () => {
  const result = await run(`${fx.A}/st`, { waitMs: 500 });
  assert.ok(result.stack, 'a successful load has a stack');
  assert.deepEqual(result.stack.edgeCdn.map((e) => e.name), ['Cloudflare'],
    'the Vercel redirect hop and the Netlify subframe are ignored');
  assert.ok(result.stack.cms.some((e) => e.name === 'WordPress'));
  assert.ok(result.stack.frameworks.some((e) => e.name === 'PHP'));
  assert.equal(JSON.stringify(result).includes('8abc'), false, 'no request id anywhere in the result');
});

test('ST a history rewrite keeps the document headers', async () => {
  const result = await run(`${fx.A}/st-rewrite`, { waitMs: 500 });
  assert.deepEqual(result.stack.edgeCdn.map((e) => e.name), ['Cloudflare']);
});

test('ST a blocked page keeps its stack and a failed load has none', async () => {
  const blocked = await run(`${fx.A}/p14`);
  assert.equal(blocked.outcome, 'blocked');
  assert.ok(blocked.stack, 'which edge answered is the useful part of a blocked page');

  const failed = await run('http://does-not-resolve.invalid/');
  assert.equal(failed.outcome, 'failed');
  assert.ok(['dns_failed', 'address_not_allowed', 'navigation_error', 'timeout'].includes(failed.outcomeReason),
    `unexpected reason ${failed.outcomeReason}`);
  assert.equal(failed.stack, null, 'a failed load has no stack');
});

// ---- privacy across the whole result -------------------------------------------------------

test('no password value and no cookie value ever appears in a result', async () => {
  const result = await run(`${fx.A}/p01`);
  const serialized = JSON.stringify(result);
  for (const cookie of result.cookies) {
    assert.equal(Object.keys(cookie).sort().join(','), 'containsSentinel,domain,name');
  }
  assert.equal(serialized.includes('prefilled@example.com'), false,
    'a visible field value must never be read');
});
