'use strict';

// Coverage and deterministic findings (BUILD-SPEC section 13).
//
// Pure function of a PageResult without its findings. No LLM anywhere: repeatable, free and
// testable. Findings say "not observed", never "missing": later steps, logged-in states and
// submit-time fields are outside the observation scope.

const { ATTRIBUTION_KEYS, UTM_KEYS, CLICK_ID_KEYS } = require('./attribution');
const { hostOf } = require('./providers');

const MAX_DETAIL = 240;
const MAX_TITLE = 80;

const SCOPE_NOTE = 'Observed on first load of the page in a clean desktop Chrome session. ' +
  'Later form steps, logged-in states, and fields added at submit time are outside this observation.';

const PROVIDER_NOTES = Object.freeze({
  hubspot: 'HubSpot attributes source from its tracking cookie and the page URL it records with each submission, so hidden UTM fields are optional. They matter when leads are handed to another system that needs the values as fields.',
  marketo: 'Marketo logs the visit URL in activity history, but lead fields only receive UTM or click ID values through hidden fields.',
  pardot: 'Pardot writes UTM values to prospect fields through hidden form fields, unless its Google Analytics connector is enabled. Click IDs always need hidden fields.',
  default: 'This provider has no built-in capture. Values reach the CRM only through hidden fields.',
});

const SENSITIVE_NAME = /api[_-]?key|secret|passw|private|bearer|score|grade|tier|internal/i;
const SENSITIVE_VALUE = /^(sk|pk|rk)_(live|test)_|^eyJ[A-Za-z0-9_-]{10,}\./;
const PROVIDER_COOKIES = [/^hubspotutk$/, /^_mkt_trk$/, /^visitor_id/];
const CLICK_ID_COOKIES = ['_gcl_aw', '_fbc', '_uetmsclkid'];

// Plain sentences, no em dashes, clamped rather than overflowed.
function clamp(text, max = MAX_DETAIL) {
  const clean = String(text).replace(/\s+/g, ' ').replace(/[—–]/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}.` : clean;
}

function nonNoise(form) {
  return (form.fields || []).filter((f) => f.noise === null);
}

// 13.1 coverage per form
function coverageForForm(form, page) {
  if (form.kind === 'login' || form.kind === 'search') return null;
  const fields = nonNoise(form);
  const blocked = page.outcome === 'blocked';
  const coverage = {};

  for (const key of ATTRIBUTION_KEYS) {
    const capturing = fields.filter((f) => (f.populatedKeys || []).includes(key));
    if (capturing.length) { coverage[key] = 'captured'; continue; }

    const named = fields.filter((f) => f.matchedKey === key);
    if (named.some((f) => f.population === 'empty' || f.population === 'constant')) {
      coverage[key] = 'present_not_populating';
      continue;
    }
    if (form.probeMatched !== true || blocked || named.some((f) => f.population === 'unknown')) {
      coverage[key] = 'unknown';
      continue;
    }
    coverage[key] = 'not_observed';
  }
  return coverage;
}

function capturedAtFor(form, key) {
  const field = nonNoise(form).find((f) => (f.populatedKeys || []).includes(key));
  return field ? (field.populationEvidence || 'load') : null;
}

// A field that holds more than one sentinel stores the landing URL, not a value of its own.
function landingUrlOnly(form, keys) {
  const fields = nonNoise(form);
  const capturing = fields.filter((f) => (f.populatedKeys || []).some((k) => keys.includes(k)));
  return capturing.length > 0 && capturing.every((f) => (f.populatedKeys || []).length > 1);
}

function finding(id, severity, formIndex, title, detail, evidence) {
  return {
    id, severity, formIndex,
    title: clamp(title, MAX_TITLE),
    detail: clamp(detail),
    evidence: evidence || {},
  };
}

function providerNoteFor(form) {
  const provider = form.provider && form.provider.provider;
  return PROVIDER_NOTES[provider] || PROVIDER_NOTES.default;
}

function utmCoverageFinding(form) {
  const coverage = form.coverage;
  const states = {};
  for (const key of UTM_KEYS) states[key] = coverage[key];
  const providerNote = providerNoteFor(form);
  const provider = form.provider && form.provider.provider;
  const evidence = { ...states, providerNote };

  const gaps = UTM_KEYS.filter((k) => coverage[k] === 'present_not_populating');
  if (gaps.length) {
    return finding('UTM_COVERAGE', 'gap', form.formIndex, 'UTM fields exist but are not being filled',
      `A field matches ${gaps.join(', ')} on this form but held no test value on the tagged load. ` +
      'The field is there and the value is not reaching it.', evidence);
  }
  const unknown = UTM_KEYS.filter((k) => coverage[k] === 'unknown');
  if (unknown.length) {
    return finding('UTM_COVERAGE', 'review', form.formIndex, 'UTM capture could not be observed',
      `This form could not be compared across the two loads, so ${unknown.length} of five UTM keys are unknown. ` +
      providerNote, evidence);
  }
  if (UTM_KEYS.every((k) => coverage[k] === 'captured')) {
    const detail = landingUrlOnly(form, UTM_KEYS)
      ? 'All five UTM values arrive, but inside one field that stores the whole landing URL rather than in fields of their own.'
      : 'All five UTM values reached hidden fields on the tagged load.';
    return finding('UTM_COVERAGE', 'info', form.formIndex, 'UTM capture is working', detail, evidence);
  }
  if (UTM_KEYS.every((k) => coverage[k] === 'not_observed') && provider === 'hubspot') {
    return finding('UTM_COVERAGE', 'info', form.formIndex, 'No UTM fields, native attribution',
      providerNote, evidence);
  }
  const captured = UTM_KEYS.filter((k) => coverage[k] === 'captured');
  return finding('UTM_COVERAGE', 'review', form.formIndex, 'Partial UTM capture',
    `${captured.length} of five UTM values were observed reaching a field. ${providerNote}`, evidence);
}

function clickIdCoverageFinding(form, page) {
  const coverage = form.coverage;
  const states = {};
  for (const key of CLICK_ID_KEYS) states[key] = coverage[key];
  const cookieHits = (page.cookies || [])
    .filter((c) => CLICK_ID_COOKIES.includes(c.name) && c.containsSentinel)
    .map((c) => c.name);
  const evidence = { ...states, clickIdCookiesWithTestValue: cookieHits };

  const gaps = CLICK_ID_KEYS.filter((k) => coverage[k] === 'present_not_populating');
  if (gaps.length) {
    return finding('CLICK_ID_COVERAGE', 'gap', form.formIndex, 'Click ID fields exist but are not being filled',
      `A field matches ${gaps.join(', ')} on this form but held no test value on the tagged load.`, evidence);
  }
  if (coverage.gclid === 'captured') {
    return finding('CLICK_ID_COVERAGE', 'info', form.formIndex, 'Google click ID is captured',
      'The gclid from the landing URL reached a hidden field on this form.', evidence);
  }
  return finding('CLICK_ID_COVERAGE', 'review', form.formIndex, 'No click ID capture observed',
    'No field on this form received a click ID from the landing URL. Paid traffic will arrive without one.', evidence);
}

function hiddenConstantsFinding(form) {
  // Section-hidden fields are later-step defaults, not constants in the attribution sense.
  // Listing a multi-step form's radio defaults here crowds out the fields that matter.
  const constants = nonNoise(form).filter((f) => f.hiddenKind !== null &&
    f.hiddenBy !== 'section' && f.population === 'constant');
  if (!constants.length) return null;
  const sample = constants.slice(0, 15).map((f) => {
    const value = f.baselineValue;
    const urlHost = value ? hostOf(value) : '';
    return {
      name: f.name || f.leakedName || f.id,
      value,
      urlHost: urlHost && urlHost !== 'placeholder.invalid' ? urlHost : null,
    };
  });
  return finding('HIDDEN_CONSTANTS', 'info', form.formIndex, 'Hidden fields carry fixed values',
    `${constants.length} hidden field${constants.length === 1 ? '' : 's'} held the same value on both loads. ` +
    'These are routing or account values rather than attribution.', { fields: sample });
}

function sensitiveHiddenValueFinding(form) {
  const hits = nonNoise(form).filter((f) => {
    if (f.hiddenKind === null) return false;
    const name = [f.name, f.id, f.leakedName].filter(Boolean).join(' ');
    return SENSITIVE_NAME.test(name) || (f.baselineValue && SENSITIVE_VALUE.test(f.baselineValue));
  });
  if (!hits.length) return null;
  // Names only. Never the value.
  const names = hits.map((f) => f.name || f.leakedName || f.id).filter(Boolean).slice(0, 15);
  return finding('SENSITIVE_HIDDEN_VALUE', 'review', form.formIndex, 'A hidden field looks sensitive',
    'A hidden field on this form is named or shaped like a key, a secret or an internal score. ' +
    'Anything in a hidden field is readable by anyone who opens the page.', { names });
}

function honeypotFinding(form) {
  const traps = (form.fields || []).filter((f) => f.noise === 'honeypot');
  if (!traps.length) return null;
  return finding('HONEYPOT_PRESENT', 'info', form.formIndex, 'The form has a honeypot',
    'A hidden trap field is present to catch bots. Nothing should ever type into it.',
    { count: traps.length });
}

function nativeTrackingFinding(form, page) {
  const contextFields = (form.fields || []).filter((f) => f.noise === 'provider_context');
  const cookies = (page.cookies || []).filter((c) => PROVIDER_COOKIES.some((re) => re.test(c.name)));
  if (!contextFields.length && !cookies.length) return null;
  const evidence = { fields: contextFields.map((f) => f.name || f.id).filter(Boolean).slice(0, 10),
    cookies: cookies.map((c) => c.name).slice(0, 10) };
  // For hs_context list the JSON keys, never the values.
  const hsContext = contextFields.find((f) => (f.name || '').toLowerCase() === 'hs_context');
  if (hsContext && hsContext.baselineValue) {
    try {
      const parsed = JSON.parse(hsContext.baselineValue);
      if (parsed && typeof parsed === 'object') evidence.hsContextKeys = Object.keys(parsed).slice(0, 20);
    } catch { /* not JSON on this page */ }
  }
  return finding('NATIVE_TRACKING', 'info', form.formIndex, 'The provider tracks this visit itself',
    'This form carries the provider account context, or the provider set its own tracking cookie. ' +
    'Some attribution reaches the CRM without hidden fields.', evidence);
}

function crossOriginFinding(form) {
  if (!form.frame || !form.frame.crossOrigin) return null;
  const anyCaptured = form.coverage && UTM_KEYS.some((k) => form.coverage[k] === 'captured');
  const severity = form.frame.paramsForwardedToFrame === false && !anyCaptured ? 'review' : 'info';
  return finding('FORM_IN_CROSS_ORIGIN_IFRAME', severity, form.formIndex,
    'The form renders in a cross-origin iframe',
    'Scripts on the parent page cannot reach fields inside this frame, so attribution values have to be ' +
    'passed on the frame URL itself.',
    { paramsForwardedToFrame: form.frame.paramsForwardedToFrame, frameUrl: form.frame.url });
}

function pageFindings(page) {
  const out = [];
  if ((page.enrichmentVendors || []).length) {
    out.push(finding('ENRICHMENT_VENDOR', 'info', null, 'A visitor enrichment vendor is on the page',
      'This page loads a vendor that identifies visitors from their IP address or email. ' +
      'It collects data outside the form.', { vendors: page.enrichmentVendors }));
  }
  if (page.scope && page.scope.consentBannerDetected) {
    out.push(finding('CONSENT_GATED', 'info', null, 'A consent banner was present',
      page.scope.consentMode === 'accept'
        ? 'A consent banner was detected and accepted before reading the page, so scripts gated behind consent had run.'
        : 'A consent banner was detected and left alone, so scripts gated behind consent had not run.',
      { consentMode: page.scope.consentMode, consentClicked: page.scope.consentClicked }));
  }
  if (page.outcome === 'blocked') {
    out.push(finding('PAGE_BLOCKED', 'review', null, 'The page blocked the inspection',
      'A bot wall answered instead of the page. Nothing here says anything about the real forms. ' +
      'On your own site the fix is an allow rule there.', { reason: page.outcomeReason }));
  }
  if (page.outcome === 'empty') {
    out.push(finding('NO_FORMS_FOUND', 'info', null, 'No forms on this page',
      'The page loaded and held no form. A form rendered after an interaction this inspection does not ' +
      'perform would not be seen.', {}));
  }
  return out;
}

// An embed container exists but no form of that provider was extracted.
function embedNotRenderedFinding(page) {
  const containers = page.embedProviders || [];
  if (!containers.length) return null;
  const rendered = new Set((page.forms || []).map((f) => f.provider && f.provider.provider));
  const missing = containers.filter((provider) => !rendered.has(provider));
  if (!missing.length) return null;
  return finding('EMBED_NOT_RENDERED', 'review', null, 'An embedded form did not render',
    `The page carries a ${missing[0]} embed container but no ${missing[0]} form appeared. ` +
    'The embed may load only after an interaction, or its loader may have failed.', { providers: missing });
}

function computeFindings(page) {
  const findings = [];
  for (const form of page.forms || []) {
    if (!form.coverage) {
      // Search and login forms get no coverage and no coverage findings, but a honeypot or a
      // sensitive value on them is still worth saying.
      for (const f of [honeypotFinding(form), sensitiveHiddenValueFinding(form)]) if (f) findings.push(f);
      continue;
    }
    findings.push(utmCoverageFinding(form));
    findings.push(clickIdCoverageFinding(form, page));
    for (const f of [hiddenConstantsFinding(form), sensitiveHiddenValueFinding(form),
      honeypotFinding(form), nativeTrackingFinding(form, page), crossOriginFinding(form)]) {
      if (f) findings.push(f);
    }
  }
  findings.push(...pageFindings(page));
  const embed = embedNotRenderedFinding(page);
  if (embed) findings.push(embed);

  const order = { gap: 0, review: 1, info: 2 };
  return findings.sort((a, b) => order[a.severity] - order[b.severity] ||
    (a.formIndex ?? -1) - (b.formIndex ?? -1));
}

module.exports = {
  computeFindings, coverageForForm, capturedAtFor, clamp,
  SCOPE_NOTE, PROVIDER_NOTES, MAX_DETAIL, MAX_TITLE,
};
