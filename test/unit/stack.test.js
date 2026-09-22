'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  detectStack, pickHeaders, VALUE_HEADERS, PRESENCE_HEADERS, CAPTURED, CATEGORIES,
  HEADER_RULES, GENERATOR_RULES, MARKER_RULES, HOST_RULES, FASTLY_NODE,
} = require('../../lib/stack');

// A rule cannot ship without a case. These four walk the WHOLE catalog.

test('every header rule fires on its declared sample', () => {
  assert.ok(HEADER_RULES.length > 0);
  for (const rule of HEADER_RULES) {
    assert.ok(rule.sample, `${rule.category}/${rule.name} has no sample`);
    const documentHeaders = { ...(rule.sample.headers || {}) };
    for (const flag of rule.sample.headerFlags || []) documentHeaders[flag] = 'x';
    const stack = detectStack({ documentHeaders });
    const hit = stack[rule.category].find((entry) => entry.name === rule.name);
    assert.ok(hit, `${rule.category}/${rule.name} did not fire on its own sample`);
    assert.equal(hit.confidence, rule.confidence);
    assert.ok(hit.evidence[0].length > 0 && hit.evidence[0].length <= 120);
  }
});

test('every header a rule reads is on a capture list', () => {
  for (const rule of HEADER_RULES) {
    assert.ok(Array.isArray(rule.reads) && rule.reads.length, `${rule.name} declares no reads`);
    for (const name of rule.reads) {
      assert.ok(CAPTURED.has(name), `${rule.name} reads ${name}, which is never captured`);
    }
  }
});

test('every generator rule fires on its sample', () => {
  for (const rule of GENERATOR_RULES) {
    const stack = detectStack({ generator: rule.sample });
    assert.ok(stack[rule.category].some((e) => e.name === rule.name), `${rule.name} missed`);
  }
});

test('every marker rule fires on each of its markers', () => {
  for (const rule of MARKER_RULES) {
    assert.ok(rule.markers.length, `${rule.name} declares no markers`);
    for (const marker of rule.markers) {
      const stack = detectStack({ domMarkers: [marker] });
      assert.ok(stack[rule.category].some((e) => e.name === rule.name), `${rule.name}/${marker} missed`);
    }
  }
});

test('every host rule matches a subdomain and rejects look-alikes on a label boundary', () => {
  for (const rule of HOST_RULES) {
    assert.ok(rule.hosts.length, `${rule.name} declares no hosts`);
    for (const suffix of rule.hosts) {
      const path = rule.path ? rule.path.source.replace(/\\/g, '') : 'asset.js';
      const good = `https://sub.${suffix}/${path.replace(/^\//, '')}`;
      const stack = detectStack({ subresourceUrls: [good], pageHost: 'example.com' });
      assert.ok(stack[rule.category].some((e) => e.name === rule.name),
        `${rule.name} missed its own host ${good}`);

      for (const lookalike of [`https://evil${suffix}/${path.replace(/^\//, '')}`,
        `https://${suffix}.attacker.example/${path.replace(/^\//, '')}`]) {
        const bad = detectStack({ subresourceUrls: [lookalike], pageHost: 'example.com' });
        assert.ok(!bad[rule.category].some((e) => e.name === rule.name),
          `${rule.name} matched the look-alike ${lookalike}`);
      }
    }
  }
});

test('no host rule nests one of its own suffixes inside another', () => {
  for (const rule of HOST_RULES) {
    for (const a of rule.hosts) {
      for (const b of rule.hosts) {
        if (a === b) continue;
        assert.ok(!a.endsWith(`.${b}`),
          `${rule.name}: ${a} is already covered by ${b}; drop the nested suffix`);
      }
    }
  }
});

test('a shared host without its path does not claim the product', () => {
  const gtm = detectStack({ subresourceUrls: ['https://www.googletagmanager.com/gtag/js?id=G-1'] });
  const names = gtm.tagManagers.map((e) => e.name);
  assert.ok(names.includes('Google tag (gtag.js)'));
  assert.ok(!names.includes('Google Tag Manager'), 'gtag.js is not GTM');

  // The Facebook SDK is not the Meta Pixel.
  const sdk = detectStack({ subresourceUrls: ['https://connect.facebook.net/en_US/sdk.js'] });
  assert.equal(sdk.advertising.length, 0);
  const pixel = detectStack({ subresourceUrls: ['https://connect.facebook.net/en_US/fbevents.js'] });
  assert.deepEqual(pixel.advertising.map((e) => e.name), ['Meta Pixel']);

  // google.com only counts when the path is a reCAPTCHA path.
  assert.equal(detectStack({ subresourceUrls: ['https://www.google.com/favicon.ico'] }).security.length, 0);
});

test('generic cache headers claim nothing', () => {
  const stack = detectStack({ documentHeaders: {
    'x-cache': 'HIT', via: '1.1 varnish', 'cf-cache-status': 'DYNAMIC', 'x-served-by': 'cache-local',
  } });
  assert.deepEqual(stack.edgeCdn, [], 'no CDN may be claimed from generic cache headers');
});

test('the Fastly cache-node pattern accepts observed forms and rejects generic ones', () => {
  for (const node of ['cache-lga-kjfk8660064-LGA', 'cache-ewr-kewr1740052-EWR',
    'cache-iad-khef600099-IAD', 'cache-ewr18120-EWR']) {
    assert.ok(FASTLY_NODE.test(node), node);
    const stack = detectStack({ documentHeaders: { 'x-served-by': node } });
    assert.ok(stack.edgeCdn.some((e) => e.name === 'Fastly'), node);
  }
  for (const node of ['cache-local', 'cache', 'varnish']) assert.equal(FASTLY_NODE.test(node), false, node);
});

test('an origin banner behind an edge is reported in its own row', () => {
  const stack = detectStack({ documentHeaders: {
    'x-fastly-request-id': 'abc', server: 'gunicorn',
  } });
  assert.deepEqual(stack.edgeCdn.map((e) => e.name), ['Fastly']);
  assert.deepEqual(stack.server.map((e) => e.name), ['Gunicorn']);
});

test('a Pardot landing page with no edge header reports an empty edge row', () => {
  const stack = detectStack({ documentHeaders: { 'x-pardot-rsp': '1', 'x-pardot-route': 'a' } });
  assert.deepEqual(stack.edgeCdn, []);
  assert.deepEqual(stack.hosting.map((e) => e.name), ['Pardot hosted page']);
});

test('no request id is ever kept as a value', () => {
  const documentHeaders = {};
  for (const name of PRESENCE_HEADERS) documentHeaders[name] = 'SECRET-REQUEST-ID';
  const stack = detectStack({ documentHeaders });
  assert.equal(JSON.stringify(stack).includes('SECRET-REQUEST-ID'), false);
  assert.deepEqual(stack.observed.headerFlags.sort(), [...PRESENCE_HEADERS].sort());
});

test('cookies, authorization and unlisted headers never enter the result', () => {
  const { headers, headerFlags } = pickHeaders({
    'set-cookie': 'session=abc', cookie: 'a=b', authorization: 'Bearer token',
    'x-custom-internal': 'hostname-prod-3', server: 'nginx',
  });
  assert.deepEqual(Object.keys(headers), ['server']);
  assert.deepEqual(headerFlags, []);
});

test('header values are one line and cut at 120', () => {
  const { headers } = pickHeaders({ server: `ngi\r\nnx ${'x'.repeat(300)}` });
  assert.equal(headers.server.length, 120);
  assert.equal(headers.server.includes('\n'), false);
  assert.equal(headers.server.includes('\r'), false);
});

test('the site is never its own asset CDN or vendor', () => {
  const stack = detectStack({
    subresourceUrls: ['https://cdn.shopify.com/s/a.js'],
    pageHost: 'cdn.shopify.com',
  });
  assert.deepEqual(stack.assetCdn, []);
});

test('every list is capped at 12 hits with at most 3 evidence strings', () => {
  const urls = [];
  for (const rule of HOST_RULES) {
    for (const suffix of rule.hosts) {
      const path = rule.path ? rule.path.source.replace(/\\/g, '').replace(/^\//, '') : 'a.js';
      for (let i = 0; i < 5; i++) urls.push(`https://n${i}.${suffix}/${path}`);
    }
  }
  const stack = detectStack({ subresourceUrls: urls, pageHost: 'example.com' });
  for (const category of CATEGORIES) {
    assert.ok(stack[category].length <= 12, `${category} has ${stack[category].length} hits`);
    for (const hit of stack[category]) {
      assert.ok(hit.evidence.length <= 3, `${category}/${hit.name} has ${hit.evidence.length} evidence`);
      for (const evidence of hit.evidence) assert.ok(evidence.length <= 120);
    }
  }
});

test('every declared category exists on the result', () => {
  const stack = detectStack({});
  for (const category of CATEGORIES) assert.ok(Array.isArray(stack[category]), category);
  assert.equal(stack.observed.fromLoad, 'baseline');
  assert.ok(VALUE_HEADERS.length > 0 && PRESENCE_HEADERS.length > 0);
});
