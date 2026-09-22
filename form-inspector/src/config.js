'use strict';

// Every environment variable, every limit, and the credential check (BUILD-SPEC 6.4, 6.5).
// server.js is the only caller that passes process.env.

const DEFAULTS = {
  FI_PORT: '3011',
  FI_HOST: '0.0.0.0',
  FI_DATA_DIR: './data',
  FI_RETENTION_DAYS: '14',
  FI_SESSION_HOURS: '12',
  FI_COOKIE_SECURE: '1',
  FI_REQUIRE_SANDBOX: '1',
  FI_CLIENT_IP_HEADER: 'cf-connecting-ip',
  FI_TRUSTED_PROXY_CIDRS: '127.0.0.0/8,::1/128,172.16.0.0/12',
  FI_UI_MAX_URLS: '5',
  FI_UI_AUDITS_PER_HOUR: '6',
  FI_UI_URLS_PER_HOUR: '20',
  FI_KEY_AUDITS_PER_HOUR: '60',
  FI_KEY_URLS_PER_HOUR: '300',
  FI_GLOBAL_URLS_PER_DAY: '500',
  FI_MAX_QUEUED_AUDITS: '10',
  FI_MAX_ACTIVE_AUDITS: '2',
  FI_MAX_CONCURRENT_INSPECTIONS: '2',
  FI_LOGIN_PER_MINUTE: '5',
};

const MAX_URLS_PER_AUDIT = 50;

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number(fallback);
}

function parseApiKeys(raw) {
  const keys = [];
  for (const entry of String(raw || '').split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(':');
    if (colon <= 0) throw new Error('FI_API_KEYS entries must be name:secret');
    const name = trimmed.slice(0, colon).trim();
    const secret = trimmed.slice(colon + 1).trim();
    if (!name) throw new Error('FI_API_KEYS entries must be name:secret');
    if (secret.length < 16) throw new Error(`FI_API_KEYS: the secret for ${name} is shorter than 16 characters`);
    keys.push({ name, secret });
  }
  return keys;
}

function loadConfig(env = {}, { log = () => {} } = {}) {
  const get = (name) => (env[name] !== undefined && env[name] !== '' ? env[name] : DEFAULTS[name]);
  const nodeEnv = env.NODE_ENV || 'production';

  const apiKeys = parseApiKeys(env.FI_API_KEYS);
  const uiPasscode = env.FI_UI_PASSCODE || null;
  if (uiPasscode !== null && uiPasscode.length < 8) {
    throw new Error('FI_UI_PASSCODE must be at least 8 characters');
  }
  // The process refuses to start without at least one credential.
  if (!apiKeys.length && !uiPasscode) {
    throw new Error('refusing to start without a credential: set FI_API_KEYS or FI_UI_PASSCODE');
  }

  // Honoured ONLY in test mode. In any other mode it is ignored, with a warning.
  let testAllow = new Set();
  if (env.FORM_INSPECTOR_TEST_ALLOW) {
    if (nodeEnv === 'test') {
      testAllow = new Set(String(env.FORM_INSPECTOR_TEST_ALLOW).split(',').map((s) => s.trim()).filter(Boolean));
    } else {
      log({ event: 'test_allow_ignored', level: 'warn',
        message: 'FORM_INSPECTOR_TEST_ALLOW is set but NODE_ENV is not test, so it is ignored' });
    }
  }

  return {
    nodeEnv,
    port: number(get('FI_PORT'), DEFAULTS.FI_PORT),
    host: get('FI_HOST'),
    dataDir: get('FI_DATA_DIR'),
    retentionDays: number(get('FI_RETENTION_DAYS'), DEFAULTS.FI_RETENTION_DAYS),

    apiKeys,
    uiPasscode,
    uiEnabled: !!uiPasscode,
    sessionSecret: env.FI_SESSION_SECRET || null,   // random per boot when unset
    sessionHours: number(get('FI_SESSION_HOURS'), DEFAULTS.FI_SESSION_HOURS),
    cookieSecure: get('FI_COOKIE_SECURE') !== '0',

    requireSandbox: get('FI_REQUIRE_SANDBOX') !== '0',
    chromiumPath: env.FI_CHROMIUM_PATH || null,

    clientIpHeader: String(get('FI_CLIENT_IP_HEADER')).toLowerCase(),
    trustedProxyCidrs: String(get('FI_TRUSTED_PROXY_CIDRS')).split(',').map((s) => s.trim()).filter(Boolean),

    limits: {
      uiMaxUrls: number(get('FI_UI_MAX_URLS'), DEFAULTS.FI_UI_MAX_URLS),
      uiAuditsPerHour: number(get('FI_UI_AUDITS_PER_HOUR'), DEFAULTS.FI_UI_AUDITS_PER_HOUR),
      uiUrlsPerHour: number(get('FI_UI_URLS_PER_HOUR'), DEFAULTS.FI_UI_URLS_PER_HOUR),
      keyAuditsPerHour: number(get('FI_KEY_AUDITS_PER_HOUR'), DEFAULTS.FI_KEY_AUDITS_PER_HOUR),
      keyUrlsPerHour: number(get('FI_KEY_URLS_PER_HOUR'), DEFAULTS.FI_KEY_URLS_PER_HOUR),
      globalUrlsPerDay: number(get('FI_GLOBAL_URLS_PER_DAY'), DEFAULTS.FI_GLOBAL_URLS_PER_DAY),
      maxQueuedAudits: number(get('FI_MAX_QUEUED_AUDITS'), DEFAULTS.FI_MAX_QUEUED_AUDITS),
      maxActiveAudits: number(get('FI_MAX_ACTIVE_AUDITS'), DEFAULTS.FI_MAX_ACTIVE_AUDITS),
      maxConcurrentInspections: number(get('FI_MAX_CONCURRENT_INSPECTIONS'), DEFAULTS.FI_MAX_CONCURRENT_INSPECTIONS),
      loginPerMinute: number(get('FI_LOGIN_PER_MINUTE'), DEFAULTS.FI_LOGIN_PER_MINUTE),
      maxUrlsPerAudit: MAX_URLS_PER_AUDIT,
      maxRequestBytes: 64 * 1024,
    },

    testAllow,
    // In test mode the allow list is the WHOLE egress allow list, so the fixture suite can
    // never reach the real internet.
    egressExclusive: nodeEnv === 'test' && testAllow.size > 0,
  };
}

module.exports = { loadConfig, parseApiKeys, DEFAULTS, MAX_URLS_PER_AUDIT };
