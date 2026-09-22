'use strict';

// THE TRUST BOUNDARY (BUILD-SPEC section 9.2).
//
// Everything that left an inspected page arrives here as a JSON string. Node parses it and
// REBUILDS the structure with trusted code: every string cut, every list capped, every enum
// checked against its allowed set, data-* maps rebuilt on a prototype-free object, markers
// filtered to a known catalog, a per-frame character budget, and the privacy rule enforced
// again whatever the page handed over.
//
// Nothing downstream ever reads the parsed page object. It reads what this module returns.

const DEFAULTS = Object.freeze({
  maxExtractionChars: 3_000_000,   // JSON one frame may hand out
  maxFrameChars: 1_200_000,        // field data KEPT per frame after the rebuild
  maxName: 200,
  maxClassToken: 60,
  maxLabel: 120,
  maxDataValue: 200,
  maxType: 30,
  maxForms: 50,
  maxFieldsPerForm: 400,
  maxScripts: 200,
  maxIframes: 60,
  maxEmbeds: 30,
  valueMax: 2000,
});

const HIDDEN_KINDS = new Set(['type_hidden', 'css_hidden', 'offscreen']);
const HIDDEN_BY = new Set(['self', 'wrapper', 'section']);
const TAGS = new Set(['input', 'select', 'textarea']);

const KNOWN_BOT_MARKERS = new Set(['cf-chl', 'px-captcha', 'captcha-delivery',
  'cf-browser-verification', 'challenge-platform', 'awswaf', 'incapsula-resource']);

const KNOWN_DOM_MARKERS = new Set(['wp-content', 'wp-includes', 'drupal-settings', 'joomla',
  'shopify', 'wix', 'squarespace', 'webflow', 'ghost', 'sitecore-media', 'sitecore-jss',
  'typo3', 'craft', 'elementor', 'aem', 'next-data', 'nuxt-data', 'hubspot-cms']);

const PROBED_GLOBALS = ['hbspt', 'MktoForms2', 'piTracker', '_elqQ', 'gform', 'JotForm'];

const FIELD_NOTES = new Set(['form not visible; field visibility judged by display only']);

function str(value, max) {
  if (typeof value !== 'string') return null;
  return value.length > max ? value.slice(0, max) : value;
}

function bool(value) {
  return value === true;
}

function enumOf(value, allowed) {
  return typeof value === 'string' && allowed.has(value) ? value : null;
}

function list(value, max) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

// Rebuilt on a prototype-free object so a page cannot smuggle __proto__ or constructor in.
function dataMap(value, maxKey, maxValue, maxKeys = 40) {
  const out = Object.create(null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  let count = 0;
  for (const key of Object.keys(value)) {
    if (count >= maxKeys) break;
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const name = str(key, maxKey);
    if (!name) continue;
    out[name] = str(value[key], maxValue) ?? '';
    count += 1;
  }
  return out;
}

function tokens(value, maxToken, maxCount = 30) {
  const out = [];
  for (const token of list(value, maxCount)) {
    const clean = str(token, maxToken);
    if (clean) out.push(clean);
  }
  return out;
}

function createBudget(max) {
  let spent = 0;
  return {
    spend(value) {
      if (typeof value !== 'string') return true;
      if (spent + value.length > max) return false;
      spent += value.length;
      return true;
    },
    get exhausted() { return spent >= max; },
    get spent() { return spent; },
  };
}

function rebuildField(raw, limits, budget) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const name = str(raw.name, limits.maxName);
  const id = str(raw.id, limits.maxName);
  const label = str(raw.label, limits.maxLabel);
  const type = str(raw.type, limits.maxType);
  const hiddenKind = enumOf(raw.hiddenKind, HIDDEN_KINDS);

  // The privacy rule, enforced again on this side of the boundary: a value survives only for
  // a hidden-kind field that is not a password, whatever the page claimed.
  let value = null;
  let valueTruncated = bool(raw.valueTruncated);
  if (hiddenKind !== null && type !== 'password') {
    value = str(raw.value, limits.valueMax);
    if (typeof raw.value === 'string' && raw.value.length > limits.valueMax) valueTruncated = true;
  }

  if (!budget.spend(name) || !budget.spend(id) || !budget.spend(label) || !budget.spend(value)) {
    return null;
  }

  const wrapperClasses = [];
  for (const level of list(raw.wrapperClasses, 3)) {
    wrapperClasses.push(tokens(level, limits.maxClassToken));
  }

  const notes = [];
  for (const note of list(raw.notes, 5)) {
    if (typeof note === 'string' && FIELD_NOTES.has(note)) notes.push(note);
  }

  return {
    tag: enumOf(raw.tag, TAGS),
    type,
    name,
    id,
    label,
    required: bool(raw.required),
    autocomplete: str(raw.autocomplete, limits.maxType),
    tabindex: str(raw.tabindex, 10),
    ariaHidden: bool(raw.ariaHidden),
    wrapperClasses,
    hiddenKind,
    hiddenBy: hiddenKind === null ? null : enumOf(raw.hiddenBy, HIDDEN_BY),
    value,
    valueTruncated,
    checked: typeof raw.checked === 'boolean' ? raw.checked : null,
    notes,
  };
}

function rebuildForm(raw, limits, budget) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const attrs = raw.attrs && typeof raw.attrs === 'object' ? raw.attrs : {};
  const fields = [];
  let truncated = false;
  for (const rawField of list(raw.fields, limits.maxFieldsPerForm)) {
    const field = rebuildField(rawField, limits, budget);
    if (field) fields.push(field);
    else truncated = true;
  }
  if (Array.isArray(raw.fields) && raw.fields.length > limits.maxFieldsPerForm) truncated = true;

  return {
    attrs: {
      id: str(attrs.id, limits.maxName),
      name: str(attrs.name, limits.maxName),
      className: str(attrs.className, limits.maxName),
      action: str(attrs.action, 500),
      method: str(attrs.method, limits.maxType),
    },
    selector: str(raw.selector, 200),
    ancestorClasses: list(raw.ancestorClasses, 4).map((level) => tokens(level, limits.maxClassToken)),
    embedAncestor: raw.embedAncestor && typeof raw.embedAncestor === 'object' && !Array.isArray(raw.embedAncestor)
      ? {
        tag: str(raw.embedAncestor.tag, limits.maxType),
        className: str(raw.embedAncestor.className, limits.maxName),
        data: dataMap(raw.embedAncestor.data, limits.maxName, limits.maxDataValue),
      }
      : null,
    inShadowDom: bool(raw.inShadowDom),
    visible: bool(raw.visible),
    classList: tokens(raw.classList, limits.maxClassToken),
    pseudoForm: bool(raw.pseudoForm),
    fields,
    truncated,
  };
}

function rebuildMarketo(raw, limits) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const entry of raw.slice(0, 50)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const names = [];
    for (const name of list(entry.names, 400)) {
      const clean = str(name, limits.maxName);
      if (clean) names.push(clean);
    }
    out.push({ id: str(entry.id, limits.maxName), names });
  }
  return out;
}

// Parse the gated string and rebuild it. `json` must be the string the page handed over.
// Returns { ok: true, frame } or { ok: false, reason }. Never throws.
function sanitizeFrame(json, options = {}) {
  const limits = { ...DEFAULTS, ...options };

  if (typeof json !== 'string') return { ok: false, reason: 'frame returned no string' };
  // Check the gate again on this side. The in-page check runs in the page's own realm.
  if (json.length > limits.maxExtractionChars) return { ok: false, reason: 'extraction exceeded the size gate' };

  let raw;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'frame returned unparseable data' };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'frame returned an unusable shape' };
  }

  const budget = createBudget(limits.maxFrameChars);
  const forms = [];
  let truncated = bool(raw.truncated);
  for (const rawForm of list(raw.forms, limits.maxForms)) {
    const form = rebuildForm(rawForm, limits, budget);
    if (form) {
      forms.push(form);
      if (form.truncated) truncated = true;
    }
  }
  if (Array.isArray(raw.forms) && raw.forms.length > limits.maxForms) truncated = true;
  if (budget.exhausted) truncated = true;

  const globals = Object.create(null);
  for (const name of PROBED_GLOBALS) {
    globals[name] = !!(raw.globals && typeof raw.globals === 'object' && raw.globals[name] === true);
  }

  const scripts = [];
  for (const src of list(raw.scripts, limits.maxScripts)) {
    const clean = str(src, 500);
    if (clean) scripts.push(clean);
  }

  const iframes = [];
  for (const frame of list(raw.iframes, limits.maxIframes)) {
    if (!frame || typeof frame !== 'object') continue;
    iframes.push({
      src: str(frame.src, 500),
      id: str(frame.id, limits.maxName),
      className: str(frame.className, limits.maxName),
    });
  }

  const embedContainers = [];
  for (const container of list(raw.embedContainers, limits.maxEmbeds)) {
    if (!container || typeof container !== 'object') continue;
    embedContainers.push({
      tag: str(container.tag, limits.maxType),
      className: str(container.className, limits.maxName),
      data: dataMap(container.data, limits.maxName, limits.maxDataValue),
    });
  }

  const botMarkers = [];
  for (const marker of list(raw.botMarkers, 20)) {
    if (typeof marker === 'string' && KNOWN_BOT_MARKERS.has(marker)) botMarkers.push(marker);
  }
  const domMarkers = [];
  for (const marker of list(raw.domMarkers, 30)) {
    if (typeof marker === 'string' && KNOWN_DOM_MARKERS.has(marker)) domMarkers.push(marker);
  }

  return {
    ok: true,
    frame: {
      frameUrl: str(raw.frameUrl, 2000),
      title: str(raw.title, limits.maxLabel),
      bodySample: str(raw.bodySample, 300) ?? '',
      generator: str(raw.generator, limits.maxDataValue),
      botMarkers,
      domMarkers,
      scripts,
      globals,
      iframes,
      embedContainers,
      forms,
      marketo: rebuildMarketo(raw.marketo, limits),
      truncated,
      charsKept: budget.spent,
    },
  };
}

module.exports = { sanitizeFrame, DEFAULTS, HIDDEN_KINDS, HIDDEN_BY, KNOWN_DOM_MARKERS, KNOWN_BOT_MARKERS };
