'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ATTRIBUTION_KEYS, UTM_KEYS, CLICK_ID_KEYS, SENTINELS,
  buildRunUrls, findSentinels, findSentinel, matchKey, matchKeyOf,
} = require('../../lib/attribution');

test('the twelve keys and their split are the contract set', () => {
  assert.deepEqual([...ATTRIBUTION_KEYS], [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'li_fat_id', 'ttclid',
  ]);
  assert.equal(UTM_KEYS.length, 5);
  assert.equal(CLICK_ID_KEYS.length, 7);
});

test('sentinel values are fitest- plus the key with hyphens', () => {
  assert.equal(SENTINELS.utm_source, 'fitest-utm-source');
  assert.equal(SENTINELS.li_fat_id, 'fitest-li-fat-id');
  assert.equal(SENTINELS.gclid, 'fitest-gclid');
  assert.equal(new Set(Object.values(SENTINELS)).size, 12, 'sentinels must be distinct');
});

test('baseline strips every attribution key and keeps everything else', () => {
  const { baselineUrl, probeUrl, hadAttribution } =
    buildRunUrls('https://e.com/c?utm_source=google&x=1&utm_term=shoes#frag');
  const base = new URL(baselineUrl);
  assert.equal(hadAttribution, true);
  assert.equal(base.searchParams.get('x'), '1');
  for (const key of ATTRIBUTION_KEYS) assert.equal(base.searchParams.has(key), false, key);
  assert.equal(base.hash, '#frag', 'the hash is kept');

  const probe = new URL(probeUrl);
  for (const key of ATTRIBUTION_KEYS) {
    assert.equal(probe.searchParams.get(key), SENTINELS[key], key);
  }
  assert.equal(probe.searchParams.get('x'), '1');
});

test('a clean URL reports no attribution and still gets all twelve on the probe', () => {
  const { baselineUrl, probeUrl, hadAttribution } = buildRunUrls('https://e.com/contact');
  assert.equal(hadAttribution, false);
  assert.equal(baselineUrl, 'https://e.com/contact');
  assert.equal(new URL(probeUrl).searchParams.getAll('gclid').length, 1);
});

test('findSentinels is a substring match on the decoded value, in key order', () => {
  assert.deepEqual(findSentinels('fitest-utm-source'), ['utm_source']);
  assert.deepEqual(findSentinels('FB.1.1700000000.fitest-fbclid'), ['fbclid'], 'wrapped values count');
  assert.deepEqual(findSentinels('FITEST-GCLID'), ['gclid'], 'case insensitive');
  assert.deepEqual(findSentinels('https%3A%2F%2Fx%2F%3Fgclid%3Dfitest-gclid'), ['gclid'], 'decoded once');
  // A landing-URL field holds several sentinels at once.
  assert.deepEqual(
    findSentinels('https://x/?utm_source=fitest-utm-source&gclid=fitest-gclid&ttclid=fitest-ttclid'),
    ['utm_source', 'gclid', 'ttclid'],
  );
  assert.deepEqual(findSentinels(''), []);
  assert.deepEqual(findSentinels(null), []);
  assert.equal(findSentinel('nothing here'), null);
  assert.equal(findSentinel('x fitest-msclkid y'), 'msclkid');
});

test('matchKey normalizes and contains, longest key first', () => {
  const table = [
    ['utm_source', 'utm_source'], ['utmsource', 'utm_source'], ['UTM_Source__c', 'utm_source'],
    ['q12_utmSource', 'utm_source'], ['00N5e00000AbCdE_utm_source', 'utm_source'],
    ['utm-medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'],
    ['UtmCampaign', 'utm_campaign'], ['utm_term', 'utm_term'], ['utm_content', 'utm_content'],
    ['gclid', 'gclid'], ['GCLID_field', 'gclid'], ['input_gclid_108', 'gclid'],
    ['msclkid', 'msclkid'], ['MSCLKID', 'msclkid'],
    ['fbclid', 'fbclid'], ['li_fat_id', 'li_fat_id'], ['liFatId', 'li_fat_id'],
    ['ttclid', 'ttclid'], ['gbraid', 'gbraid'], ['wbraid', 'wbraid'],
    ['googleClickId', 'gclid'], ['google_click_id', 'gclid'],
    ['facebook click id', 'fbclid'], ['MicrosoftClickID', 'msclkid'],
    // negatives
    ['fbc', null], ['_fbc', null], ['email', null], ['first_name', null], ['', null],
    ['utm', null], ['clid', null], ['source', null], [null, null], [undefined, null],
  ];
  for (const [input, want] of table) {
    assert.equal(matchKey(input), want, `matchKey(${JSON.stringify(input)})`);
  }
});

test('msclkid wins before gclid is tried and gclid does not match inside msclkid', () => {
  assert.equal(matchKey('msclkid'), 'msclkid');
  assert.equal('msclkid'.includes('gclid'), false);
  assert.equal(matchKey('form_msclkid_hidden'), 'msclkid');
});

test('matchKeyOf takes the first candidate that matches', () => {
  assert.equal(matchKeyOf(null, '799323_195052pi', 'utm_source'), 'utm_source');
  assert.equal(matchKeyOf('gclid', 'utm_source'), 'gclid');
  assert.equal(matchKeyOf(null, undefined, ''), null);
});
