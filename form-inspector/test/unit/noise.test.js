'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyNoise } = require('../../lib/noise');

const field = (over = {}) => ({
  tag: 'input', type: 'hidden', name: null, id: null, leakedName: null,
  hiddenKind: 'type_hidden', hiddenBy: 'self', tabindex: null, autocomplete: null, ...over,
});

test('captcha names', () => {
  for (const name of ['g-recaptcha-response', 'h-captcha-response', 'cf-turnstile-response',
    'captcha_settings', 'recaptcha-token']) {
    assert.equal(classifyNoise(field({ name })), 'captcha', name);
  }
});

test('csrf names', () => {
  for (const name of ['csrf_token', 'CSRFToken', 'xsrf', 'authenticity_token',
    '__RequestVerificationToken', '_wpnonce', 'form_nonce', '_token']) {
    assert.equal(classifyNoise(field({ name })), 'csrf', name);
  }
});

test('antispam names, including through a recovered Pardot name', () => {
  assert.equal(classifyNoise(field({ name: 'ak_js' })), 'antispam');
  assert.equal(classifyNoise(field({ name: 'ak_hp_textarea' })), 'antispam');
  assert.equal(classifyNoise(field({ name: '799323_1pi_1', leakedName: 'Spam_Filter',
    tag: 'input', type: 'text', hiddenKind: 'css_hidden', hiddenBy: 'wrapper' })), 'antispam');
});

test('framework state names', () => {
  for (const name of ['gform_submit', 'partial_entry_id', 'state_13', 'is_submit_13',
    '_wpcf7_version', '__VIEWSTATE', '__EVENTTARGET', '_utf8', 'hiddenDependentFields',
    'form_build_id', 'form_id', '_wp_http_referer', 'wpforms[id]', 'formid', 'formVid',
    'munchkinId', 'lpId', 'subId', 'lpurl', 'followupLpId', 'checksumFields', '_mktoReferrer',
    'mkt_tok']) {
    assert.equal(classifyNoise(field({ name })), 'framework_state', name);
  }
});

test('provider context names', () => {
  for (const name of ['hs_context', '_mkt_trk', 'oid', 'retURL', 'debug', 'debugEmail',
    'elqFormName', 'elqSiteId', 'elqCampaignId', 'xnQsjsdp', 'xmIwtLD', 'actionType']) {
    assert.equal(classifyNoise(field({ name })), 'provider_context', name);
  }
});

test('honeypot needs a hidden text-like input AND a name or the tabindex/autocomplete pair', () => {
  const hp = (over) => field({ tag: 'input', type: 'text', hiddenKind: 'offscreen',
    hiddenBy: 'self', ...over });
  assert.equal(classifyNoise(hp({ name: 'website' })), 'honeypot');
  assert.equal(classifyNoise(hp({ name: 'pi_extra_field' })), 'honeypot');
  assert.equal(classifyNoise(hp({ name: 'my_honeypot' })), 'honeypot');
  assert.equal(classifyNoise(hp({ name: 'hp_field' })), 'honeypot');
  assert.equal(classifyNoise(hp({ name: 'b_1234567890ab_abcdef' })), 'honeypot');
  assert.equal(classifyNoise(hp({ name: 'anything', tabindex: '-1', autocomplete: 'off' })), 'honeypot');
  assert.equal(classifyNoise(hp({ name: 'confirm_email', hiddenKind: 'css_hidden', hiddenBy: 'wrapper' })), 'honeypot');
});

test('honeypot negatives', () => {
  const hp = (over) => field({ tag: 'input', type: 'text', hiddenKind: 'offscreen',
    hiddenBy: 'self', ...over });
  // A visible field named website is a real field, not a honeypot.
  assert.equal(classifyNoise(hp({ name: 'website', hiddenKind: null })), null);
  // Hidden by a whole section means a later step, not a trap.
  assert.equal(classifyNoise(hp({ name: 'website', hiddenBy: 'section' })), null);
  // type=hidden is not the honeypot shape.
  assert.equal(classifyNoise(hp({ name: 'website', type: 'hidden', hiddenKind: 'type_hidden' })), null);
  // A checkbox is not text-like.
  assert.equal(classifyNoise(hp({ name: 'website', type: 'checkbox' })), null);
  // No signal at all.
  assert.equal(classifyNoise(hp({ name: 'company' })), null);
  assert.equal(classifyNoise(hp({ name: 'company', tabindex: '-1' })), null);
});

test('a hidden field with nothing to address it by is unnamed', () => {
  assert.equal(classifyNoise(field({ name: null, id: null, leakedName: null })), 'unnamed');
  assert.equal(classifyNoise(field({ name: '', id: '', leakedName: null })), 'unnamed');
  // A visible unnamed field is not noise; it is simply not a hidden field.
  assert.equal(classifyNoise(field({ hiddenKind: null })), null);
  // Anything addressable is not unnamed.
  assert.equal(classifyNoise(field({ id: 'input_13_108' })), null);
});

test('real data carriers with opaque names are never noise', () => {
  for (const name of ['input_98', 'input_108', '00N5e00000AbCdE', '799323_195052pi_799323_195052',
    'utm_source', 'lifecyclestage', 'lead_source']) {
    assert.equal(classifyNoise(field({ name })), null, name);
  }
});

test('a lead form consent field is not noise', () => {
  for (const name of ['gdpr', 'marketing_consent', 'consent_to_process']) {
    assert.equal(classifyNoise(field({ name, type: 'checkbox', hiddenKind: null })), null, name);
  }
});

test('bad input never throws', () => {
  for (const value of [null, undefined, 'string', 42, []]) {
    assert.equal(classifyNoise(value), null);
  }
});
