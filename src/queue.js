'use strict';

// In-process audit queue (BUILD-SPEC 14.6).
// Audits run in parallel up to maxActiveAudits. Inside one audit the URLs run strictly one
// at a time, with a 2 second pause between two URLs on the same host. One page's exception
// never ends an audit.

const { ATTRIBUTION_KEYS } = require('../lib/attribution');

const SAME_HOST_PAUSE_MS = 2000;
const OUTCOMES = ['ok', 'partial', 'empty', 'blocked', 'failed'];
const COVERAGE_STATES = ['captured', 'present_not_populating', 'not_observed', 'unknown'];

function emptySummary() {
  const outcomes = {};
  for (const outcome of OUTCOMES) outcomes[outcome] = 0;
  const coverage = {};
  for (const key of ATTRIBUTION_KEYS) {
    coverage[key] = {};
    for (const state of COVERAGE_STATES) coverage[key][state] = 0;
  }
  return { outcomes, providers: {}, edgeCdn: {}, findings: { gap: 0, review: 0, info: 0 }, coverage };
}

function rollUp(summary, result) {
  summary.outcomes[result.outcome] = (summary.outcomes[result.outcome] || 0) + 1;
  for (const form of result.forms || []) {
    const provider = form.provider && form.provider.provider;
    if (provider) summary.providers[provider] = (summary.providers[provider] || 0) + 1;
    if (!form.coverage) continue;
    for (const key of ATTRIBUTION_KEYS) {
      const state = form.coverage[key];
      if (state) summary.coverage[key][state] += 1;
    }
  }
  // Pages per EDGE CDN name only. Asset CDNs are deliberately left out of this count.
  if (result.stack) {
    for (const hit of result.stack.edgeCdn || []) {
      summary.edgeCdn[hit.name] = (summary.edgeCdn[hit.name] || 0) + 1;
    }
  }
  for (const finding of result.findings || []) {
    summary.findings[finding.severity] = (summary.findings[finding.severity] || 0) + 1;
  }
  return summary;
}

function countHiddenFields(result) {
  let count = 0;
  for (const form of result.forms || []) {
    count += form.counts.typeHidden + form.counts.cssHidden + form.counts.offscreen;
  }
  return count;
}

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

function createQueue({ storage, inspector, config, log = () => {}, now = () => new Date() }) {
  const pending = [];
  const active = new Set();
  let stopped = false;

  async function runAudit(auditId) {
    let audit;
    try {
      audit = storage.getAudit(auditId);
      if (!audit) return;
      storage.updateAudit(auditId, { status: 'running', started_at: now().toISOString() });
    } catch (error) {
      log({ event: 'audit_start_failed', auditId, error: String(error.message || error) });
      return;
    }

    const summary = emptySummary();
    let formsFound = 0;
    let hiddenFound = 0;
    let processed = 0;
    let failures = 0;
    let lastHost = null;

    for (const [position, url] of audit.urls.entries()) {
      if (stopped) break;
      const host = hostOf(url);
      if (host && host === lastHost) {
        await new Promise((resolve) => { setTimeout(resolve, SAME_HOST_PAUSE_MS); });
      }
      lastHost = host;

      let result;
      try {
        result = await inspector.inspect(url, audit.options);
      } catch (error) {
        // One page's exception never ends an audit.
        log({ event: 'page_failed', auditId, url, error: String(error.message || error) });
        result = {
          schemaVersion: 1, requestedUrl: url, finalUrl: null, outcome: 'failed',
          outcomeReason: 'navigation_error', outcomeDetail: 'the inspection threw',
          forms: [], findings: [], providers: [], stack: null, cookies: [],
          limits: { truncated: false, notes: [] }, runs: { baseline: null, probe: null },
          scope: null, enrichmentVendors: [], unmatchedDefinitions: [],
          timings: { totalMs: 0 }, inspectedAt: now().toISOString(), httpStatus: null,
        };
      }
      if (result.outcome === 'failed') failures += 1;

      rollUp(summary, result);
      formsFound += (result.forms || []).length;
      hiddenFound += countHiddenFields(result);
      processed += 1;

      // A storage write must never take the runner down: on shutdown the handle can already
      // be gone, and one page's write is not worth losing the rest of the audit.
      try {
        storage.upsertPage(auditId, { position, url, outcome: result.outcome, result });
        storage.updateAudit(auditId, {
          pages_processed: processed, forms_found: formsFound, hidden_fields_found: hiddenFound,
        });
      } catch (error) {
        log({ event: 'page_write_failed', auditId, position, error: String(error.message || error) });
      }
      log({ event: 'inspected', auditId, host, outcome: result.outcome, ms: result.timings.totalMs });
    }

    // complete = every URL was processed. failed = every page failed.
    const status = processed === audit.urls.length && failures < processed ? 'complete'
      : processed === audit.urls.length && failures === processed ? 'failed'
        : 'failed';
    try {
      storage.updateAudit(auditId, {
        status,
        summary,
        completed_at: now().toISOString(),
        error: status === 'failed' ? 'every page failed' : null,
      });
    } catch (error) {
      log({ event: 'audit_write_failed', auditId, error: String(error.message || error) });
    }
  }

  function pump() {
    while (!stopped && active.size < config.limits.maxActiveAudits && pending.length) {
      const auditId = pending.shift();
      active.add(auditId);
      runAudit(auditId)
        .catch((error) => {
          log({ event: 'audit_failed', auditId, error: String(error.message || error) });
          storage.updateAudit(auditId, { status: 'failed', error: 'the audit runner failed',
            completed_at: now().toISOString() });
        })
        .finally(() => { active.delete(auditId); pump(); });
    }
  }

  return {
    enqueue(auditId) { pending.push(auditId); pump(); },
    stats() { return { activeAudits: active.size, queuedAudits: pending.length }; },
    stop() { stopped = true; },

    // Wait for in-flight audits to finish, up to maxMs. Used on shutdown and in tests so
    // nothing is still writing when the storage handle closes.
    async drain(maxMs = 5000) {
      const deadline = Date.now() + maxMs;
      while ((active.size || pending.length) && Date.now() < deadline) {
        await new Promise((resolve) => { setTimeout(resolve, 20); });
      }
      return active.size === 0 && pending.length === 0;
    },
  };
}

module.exports = { createQueue, emptySummary, rollUp, SAME_HOST_PAUSE_MS };
