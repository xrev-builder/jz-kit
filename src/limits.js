'use strict';

// Admission counters (BUILD-SPEC 14.4).
//
// The hourly and daily windows are read from the `admissions` ledger, which is written at
// admission and is independent of the audits table. Deleting a finished audit therefore
// never refunds budget. node:sqlite is synchronous, so a reserve() runs with no await
// between the first check and the insert.

function createLimits({ storage, config, now = () => new Date() }) {
  const loginAttempts = new Map();   // client ip -> timestamps

  function principalKey(principal, clientIp) {
    return principal.kind === 'ui' ? `ui:${clientIp}` : principal.id;
  }

  function caps(principal) {
    return principal.kind === 'ui'
      ? { audits: config.limits.uiAuditsPerHour, urls: config.limits.uiUrlsPerHour,
        maxUrls: config.limits.uiMaxUrls }
      : { audits: config.limits.keyAuditsPerHour, urls: config.limits.keyUrlsPerHour,
        maxUrls: config.limits.maxUrlsPerAudit };
    }

  return {
    caps,

    // Everything in one synchronous pass, in the documented order.
    reserve({ principal, clientIp, urls }) {
      const at = now();
      const key = principalKey(principal, clientIp);
      const hourAgo = new Date(at.getTime() - 3600_000).toISOString();
      const dayAgo = new Date(at.getTime() - 86_400_000).toISOString();

      const globalUsed = storage.urlsAdmittedSince(dayAgo);
      if (globalUsed + urls > config.limits.globalUrlsPerDay) {
        return { ok: false, code: 'quota_exceeded', scope: 'global', retryAfter: 3600 };
      }
      const auditsUsed = storage.auditsAdmittedSince(hourAgo, key);
      if (auditsUsed + 1 > caps(principal).audits) {
        return { ok: false, code: 'rate_limited', scope: 'principal', retryAfter: 600 };
      }
      const urlsUsed = storage.urlsAdmittedSince(hourAgo, key);
      if (urlsUsed + urls > caps(principal).urls) {
        return { ok: false, code: 'rate_limited', scope: 'principal', retryAfter: 600 };
      }

      storage.recordAdmission(key, urls, at.toISOString());
      return { ok: true };
    },

    // Sign-in attempts per client IP. The caller also adds a constant answer delay.
    loginAllowed(clientIp) {
      const at = now().getTime();
      const window = (loginAttempts.get(clientIp) || []).filter((t) => at - t < 60_000);
      if (window.length >= config.limits.loginPerMinute) {
        loginAttempts.set(clientIp, window);
        return false;
      }
      window.push(at);
      loginAttempts.set(clientIp, window);
      return true;
    },

    resetLogin(clientIp) { loginAttempts.delete(clientIp); },
  };
}

module.exports = { createLimits };
