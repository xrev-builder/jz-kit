'use strict';

// Baseline vs probe merge (BUILD-SPEC section 12).
//
// One load cannot separate constants from URL-driven values from dynamic values, so every
// URL is loaded twice: once with attribution stripped, once with sentinels on. This module
// pairs the two runs up and reads population off the pair.

const { findSentinels, matchKeyOf, ATTRIBUTION_KEYS } = require('./attribution');

const SEARCH_FIELD_NAMES = new Set(['s', 'q', 'query', 'search', 'keys']);
const WORDPRESS_GENERIC = new Set(['wpforms', 'elementor', 'ninja_forms', 'formidable']);
const TEXT_ENTRY_TYPES = new Set(['text', 'email', 'tel', 'url', 'search', 'number', 'password']);

// Frame URLs are compared with the query string removed.
function frameKey(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return String(url).split('?')[0];
  }
}

// First rule that yields EXACTLY ONE candidate wins. Never guess.
function matchForms(baselineForms, probeForms) {
  const matches = new Map();
  const usedProbe = new Set();
  const available = () => probeForms.filter((f) => !usedProbe.has(f.formIndex));

  const rules = [
    (form, pool) => pool.filter((p) => p.provider === form.provider &&
      form.providerFormId && p.providerFormId &&
      String(p.providerFormId).toLowerCase() === String(form.providerFormId).toLowerCase()),
    (form, pool) => pool.filter((p) => p.frameKey === form.frameKey &&
      form.attrs.id && p.attrs.id === form.attrs.id),
    (form, pool) => pool.filter((p) => p.frameKey === form.frameKey &&
      p.attrs.action === form.attrs.action && p.ordinalInFrame === form.ordinalInFrame),
    (form, pool) => pool.filter((p) => p.frameKey === form.frameKey &&
      p.ordinalInFrame === form.ordinalInFrame),
  ];

  for (const rule of rules) {
    for (const form of baselineForms) {
      if (matches.has(form.formIndex)) continue;
      const candidates = rule(form, available());
      if (candidates.length === 1) {
        matches.set(form.formIndex, candidates[0]);
        usedProbe.add(candidates[0].formIndex);
      }
    }
  }
  return matches;
}

// Inside matched forms: by name, then id, then ordinal among unnamed fields.
function matchFields(baselineFields, probeFields) {
  const pairs = new Map();      // baseline field index -> probe field
  const usedProbe = new Set();

  const take = (index, field) => { pairs.set(index, field); usedProbe.add(field); };
  const free = () => probeFields.filter((f) => !usedProbe.has(f));

  baselineFields.forEach((field, index) => {
    if (!field.name) return;
    const candidates = free().filter((p) => p.name === field.name);
    if (candidates.length) take(index, candidates[0]);
  });
  baselineFields.forEach((field, index) => {
    if (pairs.has(index) || !field.id) return;
    const candidates = free().filter((p) => p.id === field.id);
    if (candidates.length) take(index, candidates[0]);
  });

  const unnamedBaseline = [];
  baselineFields.forEach((field, index) => {
    if (!pairs.has(index) && !field.name && !field.id) unnamedBaseline.push(index);
  });
  const unnamedProbe = free().filter((p) => !p.name && !p.id);
  unnamedBaseline.forEach((index, ordinal) => {
    if (unnamedProbe[ordinal]) take(index, unnamedProbe[ordinal]);
  });

  // Hidden fields that exist ONLY on the probe load. Scripts that create a hidden input only
  // when an attribution parameter is present are common; without this a working capture
  // would read as not observed.
  const probeOnly = probeFields.filter((p) => !usedProbe.has(p) && p.hiddenKind !== null);
  return { pairs, probeOnly };
}

// Population is detected by sentinel VALUE, never by field name: Salesforce 00N ids, Pardot
// obfuscated names and Gravity Forms input_N names are all opaque.
function computePopulation({ probeRan, formMatched, baselineField, probeField }) {
  const empty = { population: 'unknown', populatedFrom: null, populatedKeys: [], populationEvidence: null };
  if (baselineField && baselineField.hiddenKind === null) return empty;
  if (!probeRan || !formMatched) return empty;
  if (!probeField) return empty;

  const keys = findSentinels(probeField.value);
  if (keys.length) {
    return {
      population: 'url_param',
      populatedFrom: keys[0],
      populatedKeys: keys,
      populationEvidence: 'load',
    };
  }

  const baselineValue = baselineField ? baselineField.value : null;
  const probeValue = probeField.value;
  if (!baselineField) {
    // probe-only field, judged on the probe value alone
    if (!probeValue) return { ...empty, population: 'empty' };
    return { ...empty, population: 'dynamic' };
  }
  if ((baselineValue || '') === '' && (probeValue || '') === '') return { ...empty, population: 'empty' };
  if (baselineValue === probeValue) return { ...empty, population: 'constant' };
  return { ...empty, population: 'dynamic' };
}

// A submit button is not a field. Counting one inflates the visible-field count and can
// push a real lead form into the newsletter bucket.
const NON_DATA_TYPES = new Set(['submit', 'reset', 'button', 'image']);

function visibleFields(fields) {
  return fields.filter((f) => f.hiddenKind === null && f.noise === null &&
    !NON_DATA_TYPES.has(String(f.type || '').toLowerCase()));
}

function hasInputType(fields, type) {
  return fields.some((f) => f.type === type || (type === 'textarea' && f.tag === 'textarea'));
}

// First match wins.
function formKind(form) {
  const fields = form.fields || [];
  const visible = visibleFields(fields);

  if (fields.some((f) => f.type === 'password')) {
    return { kind: 'login', kindReason: 'the form holds a password input' };
  }

  const actionPath = (() => {
    const action = form.attrs && form.attrs.action;
    if (!action) return '';
    try { return new URL(action, 'http://placeholder.invalid').pathname; } catch { return String(action); }
  })();
  const onlyVisible = visible.length === 1 ? visible[0] : null;
  if ((form.attrs && form.attrs.role === 'search') ||
      /\/search/i.test(actionPath) ||
      (onlyVisible && onlyVisible.type === 'text' && onlyVisible.name &&
        SEARCH_FIELD_NAMES.has(onlyVisible.name.toLowerCase()))) {
    return { kind: 'search', kindReason: 'the form is a site search box' };
  }

  if (hasInputType(fields, 'email') && visible.length <= 2) {
    return { kind: 'newsletter', kindReason: 'an email input and at most two visible fields' };
  }

  const provider = form.provider && form.provider.provider;
  if (hasInputType(fields, 'email') || hasInputType(fields, 'tel') || hasInputType(fields, 'textarea') ||
      (provider && provider !== 'generic' && !WORDPRESS_GENERIC.has(provider)) ||
      visible.length >= 3) {
    let reason = 'three or more visible fields';
    if (hasInputType(fields, 'email')) reason = 'the form takes an email address';
    else if (hasInputType(fields, 'tel')) reason = 'the form takes a phone number';
    else if (hasInputType(fields, 'textarea')) reason = 'the form takes a free text message';
    else if (provider && provider !== 'generic') reason = `the form is rendered by ${provider}`;
    return { kind: 'lead', kindReason: reason };
  }

  return { kind: 'other', kindReason: 'no lead, newsletter, search or login signal' };
}

// 10.1: a generic form is dropped only on POSITIVE evidence.
const CONSENT_PATTERN = /onetrust|cookiebot|cybot|osano|didomi|truste|(^|[-_ ])cky([-_ ]|$)|cookie[-_ ]?(banner|consent|notice|dialog|settings|preferences|law)|consent[-_ ]?(banner|dialog|manager|modal)/i;

function isUtilityForm(form) {
  if (!form.provider || form.provider.provider !== 'generic') return null;
  const fields = form.fields || [];

  const hasTextEntry = fields.some((f) => f.tag === 'textarea' ||
    (f.tag === 'input' && TEXT_ENTRY_TYPES.has(String(f.type || '').toLowerCase())));

  if (!hasTextEntry) {
    const ownText = [form.attrs && form.attrs.id, form.attrs && form.attrs.className,
      ...(form.ancestorClasses || []).flat()].filter(Boolean).join(' ');
    const everyField = fields.length > 0 && fields.every((f) =>
      CONSENT_PATTERN.test([f.name, f.id, f.className].filter(Boolean).join(' ')));
    if (CONSENT_PATTERN.test(ownText) || everyField) return 'consent dialog';
  }

  const hasVisible = fields.some((f) => f.hiddenKind === null);
  const hasRealHidden = fields.some((f) => f.hiddenKind !== null && f.noise === null);
  if (!hasVisible && !hasRealHidden) return 'shell form';

  return null;
}

// matchedKey is independent of population: does anything NAME this key?
function matchedKeyFor(field) {
  return matchKeyOf(field.name, field.id, field.leakedName, field.label, field.definitionName);
}

function paramsForwardedToFrame(probeForm) {
  if (!probeForm || !probeForm.frameUrl) return null;
  return findSentinels(probeForm.frameUrl).length > 0;
}

module.exports = {
  frameKey, matchForms, matchFields, computePopulation, formKind, isUtilityForm,
  matchedKeyFor, paramsForwardedToFrame, visibleFields, ATTRIBUTION_KEYS, CONSENT_PATTERN,
};
