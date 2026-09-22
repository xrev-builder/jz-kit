'use strict';

// Bounded projections of a stored PageResult (BUILD-SPEC 14.5).

const VIEWS = Object.freeze(['summary', 'hidden', 'full']);

function stripQuery(url) {
  if (typeof url !== 'string' || !url) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

function summaryForm(form) {
  return {
    formIndex: form.formIndex,
    provider: form.provider,
    providerFormId: form.providerFormId,
    kind: form.kind,
    visible: form.visible,
    crossOrigin: form.frame ? form.frame.crossOrigin : null,
    counts: form.counts,
    coverage: form.coverage,
  };
}

function summaryView(result) {
  return {
    requestedUrl: result.requestedUrl,
    finalUrl: result.finalUrl,
    outcome: result.outcome,
    outcomeReason: result.outcomeReason,
    providers: result.providers,
    stack: result.stack,
    forms: (result.forms || []).map(summaryForm),
    findings: (result.findings || []).map((f) => ({
      id: f.id, severity: f.severity, formIndex: f.formIndex, title: f.title,
    })),
  };
}

// The fields that matter: non-noise fields that are hidden, or come from a definition or a
// script API. Section-hidden fields are listed only when they captured a test value or match
// an attribution key; otherwise they are counted in counts.sectionHidden.
function hiddenFields(form) {
  const out = [];
  for (const field of form.fields || []) {
    if (field.noise !== null) {
      out.push({ name: field.name, noise: field.noise });
      continue;
    }
    const interesting = field.hiddenKind !== null || field.source === 'definition' || field.source === 'js_api';
    if (!interesting) continue;
    if (field.hiddenBy === 'section' && !field.populatedKeys.length && !field.matchedKey) continue;
    out.push({
      source: field.source, tag: field.tag, type: field.type, name: field.name, id: field.id,
      label: field.label, leakedName: field.leakedName, required: field.required,
      hiddenKind: field.hiddenKind, hiddenBy: field.hiddenBy,
      baselineValue: field.baselineValue, probeValue: field.probeValue,
      valueTruncated: field.valueTruncated, population: field.population,
      populatedFrom: field.populatedFrom, populatedKeys: field.populatedKeys,
      populationEvidence: field.populationEvidence, probeOnly: field.probeOnly,
      matchedKey: field.matchedKey, definitionInfo: field.definitionInfo,
    });
  }
  return out;
}

function hiddenView(result) {
  const base = summaryView(result);
  return {
    ...base,
    scope: result.scope,
    limits: result.limits,
    runs: result.runs,
    cookies: result.cookies,
    enrichmentVendors: result.enrichmentVendors,
    findings: result.findings,
    forms: (result.forms || []).map((form) => ({
      ...summaryForm(form),
      pseudoForm: form.pseudoForm,
      inShadowDom: form.inShadowDom,
      selector: form.selector,
      kindReason: form.kindReason,
      probeMatched: form.probeMatched,
      attrs: { ...form.attrs, action: stripQuery(form.attrs.action) },
      frame: form.frame ? { ...form.frame, url: stripQuery(form.frame.url) } : null,
      truncated: form.truncated,
      definition: form.definition
        ? { provider: form.definition.provider, sourceUrl: form.definition.sourceUrl,
          providerFormId: form.definition.providerFormId, parseStatus: form.definition.parseStatus,
          truncated: form.definition.truncated, fieldCount: form.definition.fields.length }
        : null,
      fields: hiddenFields(form),
    })),
  };
}

function project(result, view) {
  if (view === 'full') return result;
  if (view === 'summary') return summaryView(result);
  return hiddenView(result);
}

module.exports = { project, summaryView, hiddenView, stripQuery, VIEWS };
