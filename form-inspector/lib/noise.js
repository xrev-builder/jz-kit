'use strict';

// Noise classification (BUILD-SPEC section 10). Noise fields stay in `fields` with `noise`
// set; they are excluded from coverage, from findings and from the hidden-field counts shown
// to users. Runs AFTER provider name recovery so leakedName is available.

// First match wins, in table order. Each rule is tested against name, then id, then leakedName.
const RULES = [
  ['captcha', /g-recaptcha-response|h-captcha-response|cf-turnstile-response|captcha_settings|^recaptcha-token$/i],
  ['csrf', /csrf|xsrf|authenticity_token|__RequestVerificationToken|_wpnonce|(^|_)nonce$|^_token$/i],
  ['antispam', /^ak_js$|^ak_hp_|spam/i],
  ['honeypot', null], // structural, see below
  ['framework_state', /^gform_|^partial_entry_id$|^state_\d+$|^is_submit_\d+$|^_wpcf7|^__VIEWSTATE|^__EVENT|^_utf8$|^hiddenDependentFields$|^form_build_id$|^form_id$|^_wp_http_referer$|^wpforms\[(id|author|post_id|token)\]|^formid$|^formVid$|^munchkinId$|^lpId$|^subId$|^lpurl$|^followupLpId$|^checksum(Fields)?$|^_mktoReferrer$|^mkt_tok$/],
  ['provider_context', /^hs_context$|^_mkt_trk$|^oid$|^retURL$|^debug(Email)?$|^elq(FormName|SiteId|SiteID|CampaignId|CustomerGUID|CookieWrite)$|^xnQsjsdp$|^xmIwtLD$|^actionType$/],
];

const HONEYPOT_NAMES = /honeypot|(^|_)hp(_|$)|^pi_extra_field$|^b_[0-9a-f]{10,}_[0-9a-f]{6,}$|^(website|url|fax|confirm_email)$/i;
const TEXT_LIKE_TYPES = new Set(['text', 'email', 'url', 'tel']);

function identifiers(field) {
  return [field.name, field.id, field.leakedName].filter((v) => typeof v === 'string' && v !== '');
}

function isTextLike(field) {
  if (field.tag === 'textarea') return true;
  if (field.tag !== 'input') return false;
  return TEXT_LIKE_TYPES.has(String(field.type || '').toLowerCase());
}

function isHoneypot(field) {
  if (!isTextLike(field)) return false;
  if (field.hiddenKind !== 'css_hidden' && field.hiddenKind !== 'offscreen') return false;
  if (field.hiddenBy !== 'self' && field.hiddenBy !== 'wrapper') return false;
  const byName = identifiers(field).some((v) => HONEYPOT_NAMES.test(v));
  const byAttrs = String(field.tabindex) === '-1' &&
    String(field.autocomplete || '').toLowerCase() === 'off';
  return byName || byAttrs;
}

function classifyNoise(field) {
  if (!field || typeof field !== 'object') return null;
  const ids = identifiers(field);

  for (const [noise, pattern] of RULES) {
    if (noise === 'honeypot') {
      if (isHoneypot(field)) return 'honeypot';
      continue;
    }
    if (ids.some((v) => pattern.test(v))) return noise;
  }

  // Structural rule, after the table: a hidden field with nothing to address it by cannot
  // carry a value anywhere. A native post skips it and a script has no handle on it.
  if (field.hiddenKind !== null && field.hiddenKind !== undefined && ids.length === 0) return 'unnamed';

  return null;
}

module.exports = { classifyNoise, HONEYPOT_NAMES };
