'use strict';

// inspect(url, options) -> PageResult (BUILD-SPEC sections 5, 8, 12, 13, 23).
// The engine knows nothing about HTTP, storage or callers.

const { isPublicAddress } = require('./address-policy');
const { buildRunUrls, ATTRIBUTION_KEYS, findSentinels } = require('./attribution');
const { classifyNoise } = require('./noise');
const { definitionsFromEmbedContainers, correlateDefinitions } = require('./definitions');
const providers = require('./providers');
const diff = require('./diff');
const { computeFindings, coverageForForm, SCOPE_NOTE } = require('./findings');
const { detectStack } = require('./stack');
const { runPage } = require('./run-page');

const SCHEMA_VERSION = 1;
const MAX_RESULT_BYTES = 1_500_000;
const MAX_STORED_VALUE = 300;
const GLOBAL_PAGE_SLOTS = 2;

// Global page-load slots. Two concurrent loads fit the container's memory budget.
function createSemaphore(count) {
  let free = count;
  const waiting = [];
  return {
    async acquire() {
      if (free > 0) { free -= 1; return; }
      await new Promise((resolve) => waiting.push(resolve));
    },
    release() {
      const next = waiting.shift();
      if (next) next();
      else free += 1;
    },
  };
}
const slots = createSemaphore(GLOBAL_PAGE_SLOTS);

function cutValue(value) {
  if (typeof value !== 'string') return null;
  return value.length > MAX_STORED_VALUE ? value.slice(0, MAX_STORED_VALUE) : value;
}

function emptyRunMeta(url) {
  return { url, finalUrl: null, httpStatus: null, durationMs: 0, requestCount: 0,
    beaconsBlocked: 0, egressBlocked: 0, errors: [] };
}

function baseResult(requestedUrl, options, version) {
  return {
    schemaVersion: SCHEMA_VERSION,
    requestedUrl,
    finalUrl: null,
    outcome: 'failed',
    outcomeReason: null,
    outcomeDetail: null,
    httpStatus: null,
    scope: {
      consentMode: options.consent === 'ignore' ? 'ignore' : 'accept',
      consentBannerDetected: false,
      consentClicked: null,
      probe: options.probe !== false,
      clickSelectors: options.clickSelectors || [],
      note: SCOPE_NOTE,
    },
    runs: { baseline: emptyRunMeta(requestedUrl), probe: null },
    providers: [],
    enrichmentVendors: [],
    cookies: [],
    forms: [],
    stack: null,
    unmatchedDefinitions: [],
    findings: [],
    limits: { truncated: false, notes: [] },
    timings: { totalMs: 0 },
    inspectedAt: new Date().toISOString(),
    inspectorVersion: version,
  };
}

// Flatten every frame's forms into FormResults in baseline extraction order.
function collectForms(run) {
  const out = [];
  for (const frame of run.frames) {
    const ordinals = new Map();
    frame.forms.forEach((form) => {
      const key = diff.frameKey(frame.url);
      const ordinal = (ordinals.get(key) || 0);
      ordinals.set(key, ordinal + 1);

      // The iframe element that holds this frame, for the hs-form-iframe signal.
      let parentIframeClass = '';
      if (!frame.isMainFrame) {
        for (const other of run.frames) {
          const match = (other.iframes || []).find((i) => i.src && frame.url.includes(i.src.replace(/^\/\//, '')));
          if (match) { parentIframeClass = match.className || ''; break; }
        }
      }

      out.push({
        raw: form,
        frameUrl: frame.url,
        frameKey: key,
        isMainFrame: frame.isMainFrame,
        crossOrigin: frame.crossOrigin,
        depth: frame.depth,
        ordinalInFrame: ordinal,
        parentIframeClass,
        attrs: form.attrs,
      });
    });
  }
  return out;
}

// Provider, leaked names and noise, in that order: noise classification needs leakedName.
function classifyForm(entry) {
  const hit = providers.fingerprintForm(entry.raw, {
    frameUrl: entry.frameUrl,
    parentIframeClass: entry.parentIframeClass,
  });
  const fields = entry.raw.fields.map((field) => {
    const leakedName = providers.recoverLeakedName(field, hit.provider);
    const withName = { ...field, leakedName };
    return { ...withName, noise: classifyNoise(withName) };
  });
  return { ...entry, provider: hit, providerFormId: hit.providerFormId, fields };
}

function toFormResult(entry, formIndex) {
  const { kind, kindReason } = diff.formKind({
    attrs: entry.attrs, fields: entry.fields, provider: entry.provider,
  });
  return {
    formIndex,
    frame: {
      url: entry.frameUrl, isMainFrame: entry.isMainFrame, crossOrigin: entry.crossOrigin,
      depth: entry.depth, paramsForwardedToFrame: null,
    },
    inShadowDom: entry.raw.inShadowDom,
    pseudoForm: entry.raw.pseudoForm,
    selector: entry.raw.selector,
    attrs: entry.attrs,
    provider: { provider: entry.provider.provider, confidence: entry.provider.confidence, evidence: entry.provider.evidence },
    providerFormId: entry.providerFormId,
    kind,
    kindReason,
    visible: entry.raw.visible,
    probeMatched: null,
    fields: entry.fields.map((field) => ({
      source: 'dom',
      tag: field.tag, type: field.type, name: field.name, id: field.id, label: field.label,
      leakedName: field.leakedName, required: field.required,
      hiddenKind: field.hiddenKind, hiddenBy: field.hiddenBy, noise: field.noise,
      baselineValue: field.hiddenKind !== null ? cutValue(field.value) : null,
      probeValue: null,
      valueTruncated: field.valueTruncated,
      population: 'unknown', populatedFrom: null, populatedKeys: [], populationEvidence: null,
      probeOnly: false,
      payloadValue: null,
      matchedKey: diff.matchedKeyFor(field),
      definitionInfo: null,
      _raw: field,
    })),
    definition: null,
    coverage: null,
    counts: { fields: 0, typeHidden: 0, cssHidden: 0, offscreen: 0, sectionHidden: 0, noise: 0 },
    truncated: entry.raw.truncated === true,
  };
}

function recountForm(form) {
  const counts = { fields: form.fields.length, typeHidden: 0, cssHidden: 0, offscreen: 0, sectionHidden: 0, noise: 0 };
  for (const field of form.fields) {
    if (field.noise !== null) { counts.noise += 1; continue; }
    if (field.hiddenBy === 'section') { counts.sectionHidden += 1; continue; }
    if (field.hiddenKind === 'type_hidden') counts.typeHidden += 1;
    else if (field.hiddenKind === 'css_hidden') counts.cssHidden += 1;
    else if (field.hiddenKind === 'offscreen') counts.offscreen += 1;
  }
  form.counts = counts;
}

function attachDefinition(form, definition) {
  form.definition = { ...definition, fields: definition.fields };
  for (const defField of definition.fields) {
    if (!defField.name) continue;
    let target = form.fields.find((f) => f.name === defField.name);
    if (!target) {
      const lower = defField.name.toLowerCase();
      target = form.fields.find((f) => (f.name || '').toLowerCase() === lower);
    }
    const info = { hidden: defField.hidden, defaultValue: defField.defaultValue, autofill: defField.autofill };
    if (target) {
      target.definitionInfo = info;
      if (!target.matchedKey) target.matchedKey = diff.matchedKeyFor({ name: defField.name, label: defField.label });
      continue;
    }
    // DOM absence does not prove field absence: keep it with its provenance.
    form.fields.push({
      source: 'definition', tag: null, type: defField.fieldType, name: defField.name,
      id: null, label: defField.label, leakedName: null, required: defField.required === true,
      hiddenKind: defField.hidden ? 'type_hidden' : null, hiddenBy: defField.hidden ? 'self' : null,
      noise: classifyNoise({ name: defField.name, hiddenKind: defField.hidden ? 'type_hidden' : null }),
      baselineValue: null, probeValue: null, valueTruncated: false,
      population: 'unknown', populatedFrom: null, populatedKeys: [], populationEvidence: null,
      probeOnly: false, payloadValue: null,
      matchedKey: diff.matchedKeyFor({ name: defField.name, label: defField.label }),
      definitionInfo: info,
    });
  }
}

function appendMarketoNames(forms, run) {
  for (const frame of run.frames) {
    if (!frame.marketo) continue;
    for (const entry of frame.marketo) {
      const form = forms.find((f) => f.provider.provider === 'marketo' &&
        (!entry.id || String(f.providerFormId) === String(entry.id)));
      if (!form) continue;
      for (const name of entry.names) {
        if (form.fields.some((f) => f.name === name)) continue;
        form.fields.push({
          source: 'js_api', tag: null, type: null, name, id: null, label: null, leakedName: null,
          required: false, hiddenKind: null, hiddenBy: null, noise: classifyNoise({ name, hiddenKind: null }),
          baselineValue: null, probeValue: null, valueTruncated: false,
          population: 'unknown', populatedFrom: null, populatedKeys: [], populationEvidence: null,
          probeOnly: false, payloadValue: null, matchedKey: diff.matchedKeyFor({ name }), definitionInfo: null,
        });
      }
    }
  }
}

// 6.5: a loop of cuts, each followed by a size check. The last step always fits.
function enforceSize(result, maxBytes = MAX_RESULT_BYTES) {
  const size = () => Buffer.byteLength(JSON.stringify(result), 'utf8');
  if (size() <= maxBytes) return;

  const cuts = [
    ['definitions shortened', () => {
      for (const form of result.forms) if (form.definition) form.definition.fields = form.definition.fields.slice(0, 40);
      result.unmatchedDefinitions = result.unmatchedDefinitions.slice(0, 5);
    }],
    ['irrelevant visible fields dropped', () => {
      for (const form of result.forms) {
        form.fields = form.fields.filter((f) => f.hiddenKind !== null || f.matchedKey || f.source !== 'dom');
      }
    }],
    ['section-hidden fields dropped', () => {
      for (const form of result.forms) {
        form.fields = form.fields.filter((f) => f.hiddenBy !== 'section' || f.matchedKey || f.populatedKeys.length);
      }
    }],
    ['plumbing dropped and values shortened', () => {
      for (const form of result.forms) {
        form.fields = form.fields.filter((f) => f.noise === null || f.populatedKeys.length);
        for (const field of form.fields) {
          if (field.baselineValue) field.baselineValue = field.baselineValue.slice(0, 60);
          if (field.probeValue) field.probeValue = field.probeValue.slice(0, 60);
        }
      }
    }],
    ['60 fields kept per form', () => {
      for (const form of result.forms) form.fields = form.fields.slice(0, 60);
    }],
    ['10 forms kept', () => { result.forms = result.forms.slice(0, 10); }],
    ['field lists dropped', () => { for (const form of result.forms) form.fields = []; }],
    ['forms dropped', () => { result.forms = []; result.findings = result.findings.filter((f) => f.formIndex === null); }],
  ];

  for (const [note, apply] of cuts) {
    apply();
    result.limits.notes.push(note);
    result.limits.truncated = true;
    if (size() <= maxBytes) return;
  }
}

function worseOutcome(current, next) {
  const rank = { ok: 0, partial: 1, empty: 2, blocked: 3, failed: 4 };
  return rank[next] > rank[current] ? next : current;
}

async function inspect(url, options = {}, deps = {}) {
  const started = Date.now();
  const version = deps.version || '0.1.0';
  const result = baseResult(url, options, version);

  // 1. scheme and host pre-validation. The proxy stays the enforcement point; this only
  // gives the caller a clean reason instead of a tunnel error.
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    result.outcomeReason = 'navigation_error';
    result.outcomeDetail = 'the URL could not be parsed';
    return result;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    result.outcomeReason = 'navigation_error';
    result.outcomeDetail = 'only http and https URLs are inspected';
    return result;
  }
  const allowTestHost = (deps.testAllowHosts || new Set()).has(parsed.host);
  if (!allowTestHost) {
    const net = require('node:net');
    if (net.isIP(parsed.hostname) && !isPublicAddress(parsed.hostname)) {
      result.outcome = 'failed';
      result.outcomeReason = 'address_not_allowed';
      result.outcomeDetail = 'the address is not a public internet address';
      return result;
    }
  }

  const { baselineUrl, probeUrl, hadAttribution } = buildRunUrls(url);
  result.runs.baseline.url = baselineUrl;

  await slots.acquire();
  let baseline;
  let probe = null;
  try {
    baseline = await runPage({ browserManager: deps.browserManager, url: baselineUrl, options,
      limits: deps.limits, contextOptions: deps.contextOptions });
  } finally {
    slots.release();
  }

  result.runs.baseline = { ...baseline.meta, url: baselineUrl };
  result.finalUrl = baseline.meta.finalUrl;
  result.httpStatus = baseline.meta.httpStatus;
  result.scope.consentBannerDetected = baseline.consentBannerDetected;
  result.scope.consentClicked = baseline.consentClicked;
  result.limits.notes.push(...baseline.clickSelectorNotes);
  if (hadAttribution) {
    result.limits.notes.push('attribution parameters on the requested URL were removed for baseline and replaced for probe');
  }

  // A refusal by our own egress proxy is a failed inspection with the reason the proxy gave,
  // never a bot wall and never an empty page.
  if (baseline.egressRefusal && !baseline.navigationError) {
    baseline.navigationError = baseline.egressRefusal === 'dns_failed' ? 'dns_failed' : 'address_not_allowed';
    baseline.botWall = false;
  }
  const baselineFailed = !!baseline.navigationError;
  const runProbe = options.probe !== false && !baselineFailed && !baseline.botWall;
  result.scope.probe = runProbe;

  if (runProbe) {
    await slots.acquire();
    try {
      probe = await runPage({ browserManager: deps.browserManager, url: probeUrl, options,
        limits: deps.limits, contextOptions: deps.contextOptions });
    } finally {
      slots.release();
    }
    result.runs.probe = { ...probe.meta, url: probeUrl };
  }

  // --- assemble ------------------------------------------------------------------
  const source = probe && probe.cookies.length ? probe : baseline;
  result.cookies = source.cookies;

  const baselineEntries = collectForms(baseline).map(classifyForm);
  const probeEntries = probe ? collectForms(probe).map(classifyForm) : [];

  let forms = baselineEntries.map((entry, index) => toFormResult(entry, index));

  // 10.1 utility forms, dropped on positive evidence only.
  const kept = [];
  let dropped = 0;
  for (const form of forms) {
    const reason = diff.isUtilityForm({ ...form, ancestorClasses: [] });
    if (reason) { dropped += 1; continue; }
    kept.push(form);
  }
  if (dropped) result.limits.notes.push(`${dropped} utility form${dropped === 1 ? '' : 's'} ignored (consent dialog or empty shell)`);
  forms = kept.map((form, index) => ({ ...form, formIndex: index }));

  // --- definitions ----------------------------------------------------------------
  const embedDefs = [];
  for (const frame of baseline.frames) embedDefs.push(...definitionsFromEmbedContainers(frame.embedContainers));
  // The same definition is served on BOTH loads. Deduplicate before correlating, or the
  // second copy loses rule 1 (its form is taken) and falls through to unmatched.
  const seenDefinitions = new Set();
  const allDefinitions = [];
  for (const definition of [...baseline.definitions, ...(probe ? probe.definitions : []), ...embedDefs]) {
    const key = `${definition.provider}|${definition.providerFormId || ''}|${definition.sourceUrl}|${definition.fields.length}`;
    if (seenDefinitions.has(key)) continue;
    seenDefinitions.add(key);
    allDefinitions.push(definition);
  }
  const { attached, unmatched } = correlateDefinitions(
    forms.map((f) => ({ formIndex: f.formIndex, provider: f.provider.provider, providerFormId: f.providerFormId })),
    allDefinitions,
  );
  for (const [formIndex, definition] of attached) {
    const form = forms.find((f) => f.formIndex === formIndex);
    if (form) attachDefinition(form, definition);
  }
  result.unmatchedDefinitions = unmatched;
  appendMarketoNames(forms, baseline);

  // --- baseline vs probe ------------------------------------------------------------
  let probeUnmatched = false;
  if (probe) {
    const probeForms = probeEntries.map((entry, index) => ({
      formIndex: index,
      provider: entry.provider.provider,
      providerFormId: entry.providerFormId,
      frameKey: entry.frameKey,
      frameUrl: entry.frameUrl,
      ordinalInFrame: entry.ordinalInFrame,
      attrs: entry.attrs,
      fields: entry.fields,
    }));
    const baselineForMatch = forms.map((f) => ({
      formIndex: f.formIndex, provider: f.provider.provider, providerFormId: f.providerFormId,
      frameKey: diff.frameKey(f.frame.url), ordinalInFrame: 0, attrs: f.attrs,
    }));
    // Keep the per-frame ordinal that collectForms computed.
    baselineEntries.forEach((entry) => {
      const match = forms.find((f) => f.frame.url === entry.frameUrl && f.selector === entry.raw.selector);
      if (match) {
        const row = baselineForMatch.find((b) => b.formIndex === match.formIndex);
        if (row) row.ordinalInFrame = entry.ordinalInFrame;
      }
    });

    const matches = diff.matchForms(baselineForMatch, probeForms);
    for (const form of forms) {
      const probeForm = matches.get(form.formIndex) || null;
      form.probeMatched = !!probeForm;
      form.frame.paramsForwardedToFrame = form.frame.isMainFrame
        ? null
        : diff.paramsForwardedToFrame(probeForm);

      if (!probeForm) {
        if (form.kind !== 'search' && form.kind !== 'login') probeUnmatched = true;
        continue;
      }

      const domFields = form.fields.filter((f) => f.source === 'dom');
      const { pairs, probeOnly } = diff.matchFields(
        domFields.map((f) => f._raw || f),
        probeForm.fields,
      );

      domFields.forEach((field, index) => {
        const probeField = pairs.get(index) || null;
        if (probeField) field.probeValue = field.hiddenKind !== null ? cutValue(probeField.value) : null;
        const population = diff.computePopulation({
          probeRan: true, formMatched: true,
          baselineField: field.hiddenKind !== null ? { hiddenKind: field.hiddenKind, value: (field._raw || {}).value ?? field.baselineValue } : { hiddenKind: null },
          probeField: probeField ? { value: probeField.value } : null,
        });
        Object.assign(field, population);
      });

      for (const extra of probeOnly) {
        const withName = { ...extra, leakedName: providers.recoverLeakedName(extra, form.provider.provider) };
        const population = diff.computePopulation({
          probeRan: true, formMatched: true, baselineField: null, probeField: { value: extra.value },
        });
        form.fields.push({
          source: 'dom', tag: extra.tag, type: extra.type, name: extra.name, id: extra.id,
          label: extra.label, leakedName: withName.leakedName, required: extra.required,
          hiddenKind: extra.hiddenKind, hiddenBy: extra.hiddenBy, noise: classifyNoise(withName),
          baselineValue: null, probeValue: cutValue(extra.value), valueTruncated: extra.valueTruncated,
          ...population, probeOnly: true, payloadValue: null,
          matchedKey: diff.matchedKeyFor(withName), definitionInfo: null,
        });
      }
    }
  }

  for (const form of forms) {
    for (const field of form.fields) delete field._raw;
    recountForm(form);
  }

  // --- page level -------------------------------------------------------------------
  const ctx = { frames: baseline.frames, requestHosts: baseline.requestHosts };
  result.providers = providers.detectPageProviders(ctx);
  const sharpspring = providers.sharpspringFromConstants(
    forms.map((f) => ({ fields: f.fields.map((x) => ({ value: x.baselineValue })) })),
  );
  if (sharpspring && !result.providers.some((p) => p.provider === 'sharpspring')) {
    result.providers.unshift(sharpspring);
  }
  result.enrichmentVendors = providers.detectEnrichmentVendors(ctx);

  const mainFrame = baseline.frames.find((f) => f.isMainFrame);
  if (!baselineFailed && baseline.documentHeaders) {
    const documentOrigin = (() => { try { return new URL(baseline.documentUrl).origin; } catch { return null; } })();
    const pageOrigin = (() => { try { return new URL(baseline.meta.finalUrl || baselineUrl).origin; } catch { return null; } })();
    // Headers are used only if their origin equals the page's origin.
    const headers = documentOrigin && pageOrigin && documentOrigin === pageOrigin ? baseline.documentHeaders : {};
    result.stack = detectStack({
      documentHeaders: headers,
      subresourceUrls: baseline.subresourceUrls,
      scripts: mainFrame ? mainFrame.scripts : [],
      generator: mainFrame ? mainFrame.generator : null,
      domMarkers: mainFrame ? mainFrame.domMarkers : [],
      pageHost: pageOrigin ? new URL(pageOrigin).hostname : '',
    });
  }

  result.forms = forms;

  // --- outcome -----------------------------------------------------------------------
  const formCount = forms.length;
  if (baselineFailed) {
    result.outcome = 'failed';
    result.outcomeReason = baseline.navigationError;
    result.outcomeDetail = baseline.egressRefusal
      ? `the egress proxy refused this address (${baseline.egressRefusal})`
      : baseline.meta.errors[0] || 'the page did not load';
  } else if (baseline.botWall) {
    result.outcome = 'blocked';
    result.outcomeReason = 'bot_wall';
    result.outcomeDetail = 'a bot wall answered instead of the page';
  } else if (baseline.frameErrorOnMain) {
    result.outcome = 'partial';
    result.outcomeReason = 'frame_errors';
    result.outcomeDetail = 'the main document could not be read';
  } else if (formCount === 0) {
    const status = baseline.meta.httpStatus;
    if (status !== null && status >= 400) {
      result.outcome = 'failed';
      result.outcomeReason = 'http_error';
      result.outcomeDetail = `the page answered ${status} and held no form`;
    } else {
      result.outcome = 'empty';
      result.outcomeReason = 'no_forms';
      result.outcomeDetail = 'the page loaded and held no form';
    }
  } else {
    result.outcome = 'ok';
    result.outcomeReason = null;
  }

  if (result.outcome === 'ok' || result.outcome === 'empty') {
    if (baseline.meta.errors.length) {
      result.outcome = worseOutcome(result.outcome, 'partial');
      result.outcomeReason = 'frame_errors';
      result.outcomeDetail = baseline.meta.errors[0];
    }
    if (probeUnmatched) {
      result.outcome = worseOutcome(result.outcome, 'partial');
      result.outcomeReason = 'probe_unmatched';
      result.outcomeDetail = 'a form could not be paired between the two loads';
    }
  }

  // --- coverage and findings ----------------------------------------------------------
  for (const form of forms) form.coverage = coverageForForm(form, result);

  const embedProviders = new Set();
  for (const frame of baseline.frames) {
    for (const container of frame.embedContainers) {
      const cls = (container.className || '').toLowerCase();
      if (cls.includes('hs-form') || (container.data['form-id'] && container.data['portal-id'])) embedProviders.add('hubspot');
      if (container.data['tf-widget'] || container.data['tf-live']) embedProviders.add('typeform');
      if (container.data['form-block-id']) embedProviders.add('dynamics');
    }
  }
  result.embedProviders = [...embedProviders];
  result.findings = computeFindings(result);
  if (result.findings.some((f) => f.id === 'EMBED_NOT_RENDERED') &&
      (result.outcome === 'ok' || result.outcome === 'empty')) {
    result.outcome = 'partial';
    result.outcomeReason = 'embed_not_rendered';
    result.outcomeDetail = 'an embed container is on the page but its form did not render';
  }
  delete result.embedProviders;

  for (const frame of baseline.frames) {
    if (frame.truncated) {
      result.limits.truncated = true;
      if (!result.limits.notes.includes('a frame hit the extraction budget')) {
        result.limits.notes.push('a frame hit the extraction budget');
      }
    }
  }

  result.timings.totalMs = Date.now() - started;
  enforceSize(result);
  if (result.limits.truncated && (result.outcome === 'ok' || result.outcome === 'empty')) {
    result.outcome = 'partial';
    result.outcomeReason = result.outcomeReason || 'limits_hit';
  }
  return result;
}

module.exports = { inspect, enforceSize, MAX_RESULT_BYTES, SCHEMA_VERSION, ATTRIBUTION_KEYS, findSentinels };
