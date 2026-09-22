'use strict';

// Provider fingerprints, provider-specific name recovery and page-level provider signals
// (BUILD-SPEC 11.1, 11.2).
//
// The rule that keeps this honest: a PAGE-level signal never labels an individual form. A
// search box on a HubSpot site stays generic/low. Only form-level evidence promotes a form.

const PROVIDER_IDS = Object.freeze([
  'hubspot', 'marketo', 'pardot', 'salesforce_w2l', 'eloqua',
  'gravity_forms', 'cf7', 'wpforms', 'ninja_forms', 'formidable', 'elementor',
  'typeform', 'jotform', 'google_forms', 'mailchimp', 'klaviyo', 'activecampaign',
  'dynamics', 'zoho', 'unbounce', 'webflow', 'formstack', 'sharpspring', 'calendly', 'generic',
]);

const PARDOT_NAME_RE = /^\d+_\d+pi_\d+_\d+$/;
const PARDOT_ACTION_RE = /\/l\/\d+\/\d{4}-\d{2}-\d{2}\//;
const GUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function hostOf(url) {
  try { return new URL(url, 'http://placeholder.invalid').hostname.toLowerCase(); }
  catch { return ''; }
}

// Suffix match ON A LABEL BOUNDARY. evilcloudfront.net must not match cloudfront.net.
function hostEndsWith(host, suffix) {
  if (!host || !suffix) return false;
  const h = host.toLowerCase();
  const s = suffix.toLowerCase();
  return h === s || h.endsWith(`.${s}`);
}

function classSet(form) {
  const out = new Set();
  for (const token of form.classList || []) out.add(token.toLowerCase());
  return out;
}

function ancestorTokens(form) {
  const out = new Set();
  for (const level of form.ancestorClasses || []) {
    for (const token of level) out.add(token.toLowerCase());
  }
  return out;
}

function fieldNames(form) {
  const out = new Set();
  for (const field of form.fields || []) {
    if (field.name) out.add(field.name);
    if (field.id) out.add(field.id);
  }
  return out;
}

function fieldNamed(form, name) {
  const wanted = name.toLowerCase();
  return (form.fields || []).some((f) =>
    (f.name && f.name.toLowerCase() === wanted) || (f.id && f.id.toLowerCase() === wanted));
}

function hit(provider, confidence, evidence) {
  return { provider, confidence, evidence: evidence.slice(0, 3).map((e) => String(e).slice(0, 120)) };
}

// ---- form-level fingerprint ----------------------------------------------------------

// ctx: { frameUrl, frameHost, parentIframeClass, mainOrigin }
function fingerprintForm(form, ctx = {}) {
  const classes = classSet(form);
  const ancestors = ancestorTokens(form);
  const id = (form.attrs && form.attrs.id) || '';
  const action = (form.attrs && form.attrs.action) || '';
  const actionHost = action ? hostOf(action) : '';
  const frameHost = ctx.frameHost || hostOf(ctx.frameUrl || '');
  const embed = form.embedAncestor;
  const embedData = (embed && embed.data) || {};
  const embedClass = ((embed && embed.className) || '').toLowerCase();
  const evidence = [];
  let providerFormId = null;

  const has = (cls) => classes.has(cls);
  const anc = (cls) => ancestors.has(cls);

  // hubspot
  if (has('hs-form') || /^hsform_/i.test(id) || fieldNamed(form, 'hs_context') ||
      /hs-form-iframe/i.test(ctx.parentIframeClass || '') ||
      hostEndsWith(frameHost, 'hsforms.com') || hostEndsWith(frameHost, 'hsforms.net') ||
      hostEndsWith(frameHost, 'hsappstatic.net') ||
      embedClass.includes('hs-form-frame') || embedClass.includes('hs-form-html') ||
      (embedData['form-id'] && embedData['portal-id'])) {
    if (has('hs-form')) evidence.push('form class hs-form');
    if (/^hsform_/i.test(id)) evidence.push(`form id ${id}`);
    if (fieldNamed(form, 'hs_context')) evidence.push('field hs_context');
    if (hostEndsWith(frameHost, 'hsforms.com') || hostEndsWith(frameHost, 'hsforms.net')) {
      evidence.push(`frame host ${frameHost}`);
    }
    if (embedClass) evidence.push(`embed container ${embedClass}`);
    const fromId = GUID_RE.exec(id);
    providerFormId = (fromId && fromId[0]) || embedData['form-id'] ||
      (GUID_RE.exec(ctx.frameUrl || '') || [null])[0] || null;
    return { ...hit('hubspot', 'high', evidence), providerFormId };
  }

  // marketo
  if (has('mktoform') || /^mktoform_/i.test(id)) {
    const digits = /^mktoForm_(\d+)/i.exec(id);
    return {
      ...hit('marketo', 'high', [has('mktoform') ? 'form class mktoForm' : `form id ${id}`]),
      providerFormId: digits ? digits[1] : null,
    };
  }

  // pardot
  if (id.toLowerCase() === 'pardot-form' || fieldNamed(form, 'pi_extra_field') ||
      PARDOT_ACTION_RE.test(action) ||
      [...fieldNames(form)].some((n) => PARDOT_NAME_RE.test(n))) {
    if (id.toLowerCase() === 'pardot-form') evidence.push('form id pardot-form');
    if (fieldNamed(form, 'pi_extra_field')) evidence.push('field pi_extra_field');
    if (PARDOT_ACTION_RE.test(action)) evidence.push('Pardot landing page action path');
    const obfuscated = [...fieldNames(form)].find((n) => PARDOT_NAME_RE.test(n));
    if (obfuscated) evidence.push(`obfuscated field name ${obfuscated}`);
    return { ...hit('pardot', 'high', evidence), providerFormId: null };
  }

  // salesforce web-to-lead
  if (/servlet\/servlet\.WebToLead|servlet\.WebToCase/i.test(action)) {
    return {
      ...hit('salesforce_w2l', 'high', [`action ${action.slice(0, 100)}`,
        fieldNamed(form, 'oid') ? 'field oid' : null].filter(Boolean)),
      providerFormId: null,
    };
  }

  // eloqua
  if (hostEndsWith(actionHost, 't.eloqua.com') || fieldNamed(form, 'elqFormName') || fieldNamed(form, 'elqSiteId')) {
    const named = (form.fields || []).find((f) => (f.name || '').toLowerCase() === 'elqformname');
    return {
      ...hit('eloqua', 'high', [actionHost ? `action host ${actionHost}` : 'field elqFormName']),
      providerFormId: named ? named.value : null,
    };
  }

  // gravity forms
  if (/^gform_/i.test(id) || anc('gform_wrapper') || fieldNamed(form, 'gform_submit')) {
    const digits = /^gform_(\d+)/i.exec(id);
    if (/^gform_/i.test(id)) evidence.push(`form id ${id}`);
    if (anc('gform_wrapper')) evidence.push('ancestor .gform_wrapper');
    if (fieldNamed(form, 'gform_submit')) evidence.push('field gform_submit');
    return { ...hit('gravity_forms', 'high', evidence), providerFormId: digits ? digits[1] : null };
  }

  // contact form 7
  if (has('wpcf7-form') || [...fieldNames(form)].some((n) => /^_wpcf7$/i.test(n))) {
    const unit = (form.fields || []).find((f) => (f.name || '').toLowerCase() === '_wpcf7');
    return { ...hit('cf7', 'high', ['form class wpcf7-form']), providerFormId: unit ? unit.value : null };
  }

  if (has('wpforms-form')) return { ...hit('wpforms', 'high', ['form class wpforms-form']), providerFormId: null };
  if (anc('nf-form-cont')) return { ...hit('ninja_forms', 'high', ['ancestor .nf-form-cont']), providerFormId: null };
  if (has('frm-show-form')) return { ...hit('formidable', 'high', ['form class frm-show-form']), providerFormId: null };
  if (has('elementor-form')) return { ...hit('elementor', 'high', ['form class elementor-form']), providerFormId: null };

  // typeform
  if (hostEndsWith(frameHost, 'typeform.com')) {
    const seg = /\/to\/([A-Za-z0-9_-]+)/.exec(ctx.frameUrl || '');
    return { ...hit('typeform', 'high', [`frame host ${frameHost}`]), providerFormId: seg ? seg[1] : null };
  }

  // jotform
  if (has('jotform-form') || hostEndsWith(actionHost, 'jotform.com') || hostEndsWith(frameHost, 'jotform.com')) {
    const numeric = /(\d{8,})/.exec(action) || /(\d{8,})/.exec(ctx.frameUrl || '');
    return {
      ...hit('jotform', 'high', [has('jotform-form') ? 'form class jotform-form' : `host ${actionHost || frameHost}`]),
      providerFormId: numeric ? numeric[1] : null,
    };
  }

  if (/docs\.google\.com\/forms/i.test(action) && /formResponse/i.test(action)) {
    return { ...hit('google_forms', 'high', ['action docs.google.com/forms']), providerFormId: null };
  }
  if (hostEndsWith(actionHost, 'list-manage.com')) {
    return { ...hit('mailchimp', 'high', [`action host ${actionHost}`]), providerFormId: null };
  }
  if ([...classes].some((c) => c.includes('klaviyo-form'))) {
    return { ...hit('klaviyo', 'high', ['form class klaviyo-form']), providerFormId: null };
  }
  if (/activehosted\.com\/proc\.php/i.test(action)) {
    return { ...hit('activecampaign', 'high', ['action activehosted.com/proc.php']), providerFormId: null };
  }

  // dynamics
  if (embedData['form-block-id'] || (embedData['form-id'] && embedData['form-api-url'])) {
    return {
      ...hit('dynamics', 'high', ['embed container data-form-block-id']),
      providerFormId: embedData['form-block-id'] || embedData['form-id'] || null,
    };
  }

  if (fieldNamed(form, 'xnQsjsdp') || hostEndsWith(actionHost, 'zoho.com') || hostEndsWith(actionHost, 'zohopublic.com')) {
    return { ...hit('zoho', 'high', [fieldNamed(form, 'xnQsjsdp') ? 'field xnQsjsdp' : `action host ${actionHost}`]), providerFormId: null };
  }
  if (anc('lp-pom-form')) return { ...hit('unbounce', 'high', ['ancestor .lp-pom-form']), providerFormId: null };
  if (anc('w-form') || (form.attrs && form.attrs.className && /data-wf-page-id/.test(form.attrs.className))) {
    return { ...hit('webflow', 'high', ['ancestor .w-form']), providerFormId: null };
  }
  if (hostEndsWith(actionHost, 'formstack.com')) {
    return { ...hit('formstack', 'high', [`action host ${actionHost}`]), providerFormId: null };
  }

  return { ...hit('generic', 'low', []), providerFormId: null };
}

// ---- Pardot name recovery (11.2) -----------------------------------------------------

const PARDOT_WRAPPER_NOISE = new Set(['form-field', 'pd-hidden', 'hidden', 'required', 'error', 'no-label']);

// The real field name leaks through the wrapper class:
//   <div class="form-field utm_source pd-hidden hidden">
function recoverPardotName(field) {
  for (const level of field.wrapperClasses || []) {
    const lowered = level.map((t) => t.toLowerCase());
    if (!lowered.includes('form-field') || !lowered.includes('pd-hidden')) continue;
    for (const token of level) {
      const lower = token.toLowerCase();
      if (PARDOT_WRAPPER_NOISE.has(lower)) continue;
      if (lower.startsWith('pd-')) continue;
      return token;
    }
  }
  return null;
}

function recoverLeakedName(field, provider) {
  if (provider === 'pardot') return recoverPardotName(field);
  return null;
}

// ---- page-level signals --------------------------------------------------------------

const PAGE_SCRIPT_HOSTS = [
  ['hubspot', ['hsforms.net', 'hs-scripts.com', 'hsforms.com', 'hsappstatic.net']],
  ['marketo', ['munchkin.marketo.net']],
  ['pardot', ['pi.pardot.com']],
  ['typeform', ['embed.typeform.com']],
  ['jotform', ['jotform.com']],
  ['klaviyo', ['static.klaviyo.com']],
  ['calendly', ['calendly.com', 'assets.calendly.com']],
  ['dynamics', ['mkt.dynamics.com']],
  ['sharpspring', ['marketingautomation.services']],
  ['eloqua', ['eloqua.com']],
  ['activecampaign', ['activehosted.com']],
  ['formstack', ['formstack.com']],
  ['unbounce', ['unbouncepages.com']],
];

const PAGE_GLOBALS = [
  ['hubspot', 'hbspt'], ['marketo', 'MktoForms2'], ['pardot', 'piTracker'],
  ['eloqua', '_elqQ'], ['gravity_forms', 'gform'], ['jotform', 'JotForm'],
];

const ENRICHMENT_HOSTS = [
  ['zoominfo', ['ws.zoominfo.com', 'zi-scripts.com']],
  ['clearbit', ['clearbitjs.com', 'clearbitscripts.com']],
  ['6sense', ['6sc.co']],
  ['demandbase', ['demandbase.com']],
];

// ctx: { frames: [sanitized frames], requestHosts: string[], mainOrigin }
function detectPageProviders(ctx = {}) {
  const frames = ctx.frames || [];
  const hosts = new Set();
  for (const host of ctx.requestHosts || []) hosts.add(String(host).toLowerCase());
  for (const frame of frames) {
    for (const src of frame.scripts || []) {
      const host = hostOf(src.startsWith('//') ? `https:${src}` : src);
      if (host && host !== 'placeholder.invalid') hosts.add(host);
    }
    for (const iframe of frame.iframes || []) {
      if (!iframe.src) continue;
      const host = hostOf(iframe.src.startsWith('//') ? `https:${iframe.src}` : iframe.src);
      if (host && host !== 'placeholder.invalid') hosts.add(host);
    }
  }

  const found = new Map();
  const add = (provider, confidence, evidence) => {
    const existing = found.get(provider);
    if (!existing) { found.set(provider, hit(provider, confidence, [evidence])); return; }
    if (existing.evidence.length < 3) existing.evidence.push(String(evidence).slice(0, 120));
  };

  for (const [provider, suffixes] of PAGE_SCRIPT_HOSTS) {
    for (const host of hosts) {
      if (suffixes.some((s) => hostEndsWith(host, s))) add(provider, 'medium', `host ${host}`);
    }
  }
  for (const frame of frames) {
    for (const [provider, name] of PAGE_GLOBALS) {
      if (frame.globals && frame.globals[name]) add(provider, 'medium', `global ${name}`);
    }
    for (const container of frame.embedContainers || []) {
      const cls = (container.className || '').toLowerCase();
      if (cls.includes('hs-form-frame') || cls.includes('hs-form-html') ||
          (container.data && container.data['form-id'] && container.data['portal-id'])) {
        add('hubspot', 'medium', `embed container ${cls || 'data-form-id'}`);
      }
      if (container.data && (container.data['tf-widget'] || container.data['tf-live'])) {
        add('typeform', 'medium', 'embed container data-tf-widget');
      }
      if (container.data && container.data['form-block-id']) {
        add('dynamics', 'medium', 'embed container data-form-block-id');
      }
    }
  }
  // Marketo also announces itself by request path rather than host.
  for (const host of hosts) {
    if (hostEndsWith(host, 'marketo.net') || hostEndsWith(host, 'mktoweb.com')) {
      add('marketo', 'medium', `host ${host}`);
    }
  }

  const order = { high: 0, medium: 1, low: 2 };
  return [...found.values()].sort((a, b) => order[a.confidence] - order[b.confidence] ||
    a.provider.localeCompare(b.provider));
}

function detectEnrichmentVendors(ctx = {}) {
  const hosts = new Set();
  for (const host of ctx.requestHosts || []) hosts.add(String(host).toLowerCase());
  for (const frame of ctx.frames || []) {
    for (const src of frame.scripts || []) {
      const host = hostOf(src.startsWith('//') ? `https:${src}` : src);
      if (host && host !== 'placeholder.invalid') hosts.add(host);
    }
  }
  const out = [];
  for (const [vendor, suffixes] of ENRICHMENT_HOSTS) {
    for (const host of hosts) {
      if (suffixes.some((s) => hostEndsWith(host, s))) { out.push(vendor); break; }
    }
  }
  return out;
}

// A Gravity Forms form that posts back to SharpSpring stays gravity_forms; SharpSpring is
// added alongside, as a page-level vendor hit.
function sharpspringFromConstants(forms) {
  for (const form of forms) {
    for (const field of form.fields || []) {
      if (!field.value) continue;
      const host = hostOf(field.value);
      if (host && hostEndsWith(host, 'marketingautomation.services')) {
        return hit('sharpspring', 'high', [`hidden constant posts back to ${host}`]);
      }
    }
  }
  return null;
}

module.exports = {
  PROVIDER_IDS, fingerprintForm, recoverLeakedName, recoverPardotName,
  detectPageProviders, detectEnrichmentVendors, sharpspringFromConstants,
  hostOf, hostEndsWith,
};
