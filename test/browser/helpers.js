'use strict';
const { createBrowserManager } = require('../../lib/browser');
const { inspect } = require('../../lib/inspect');
const fx = require('../fixtures/server');

const TEST_ALLOW = new Set([
  `127.0.0.1:${fx.PORT_A}`, `127.0.0.1:${fx.PORT_B}`, `127.0.0.1:${fx.PORT_COLLECTOR}`,
]);
// inspect()'s own pre-validation would refuse loopback. The fixture hosts are named here so
// the engine reaches the proxy, which is the real enforcement point.
const TEST_ALLOW_HOSTS = new Set([
  `127.0.0.1:${fx.PORT_A}`, `127.0.0.1:${fx.PORT_B}`, `127.0.0.1:${fx.PORT_COLLECTOR}`,
]);

// FI_REQUIRE_SANDBOX is honoured here exactly as in production. The suite runs with 0 only
// where the Chromium sandbox cannot start (see README, Running the browser suite).
const REQUIRE_SANDBOX = process.env.FI_REQUIRE_SANDBOX !== '0';

function makeBrowserManager(overrides = {}) {
  return createBrowserManager({
    requireSandbox: REQUIRE_SANDBOX,
    chromiumPath: process.env.FI_CHROMIUM_PATH || undefined,
    testAllow: TEST_ALLOW,
    // The test allow list is the WHOLE allow list, so a recorded fixture that references a
    // live third-party script can never reach it.
    egressExclusive: true,
    log: () => {},
    ...overrides,
  });
}

// The fixture server answers instantly, so the production settle times only add wall clock.
// Nothing about the pipeline changes: the same events fire in the same order.
const TEST_LIMITS = Object.freeze({
  wheelStepMs: 60,
  consentSettleMs: 400,
  networkIdleTimeoutMs: 3000,
  navigationTimeoutMs: 15000,
});

async function withEngine(fn) {
  const server = fx.createFixtureServer();
  await server.start();
  const browserManager = makeBrowserManager();
  const run = (url, options = {}) =>
    inspect(url, { waitMs: 300, ...options }, { browserManager, testAllowHosts: TEST_ALLOW_HOSTS, limits: TEST_LIMITS });
  try {
    await fn({ run, server, browserManager, fx });
  } finally {
    await browserManager.close();
    await server.stop();
  }
}

const formById = (result, id) => result.forms.find((f) => f.attrs.id === id);
const field = (form, name) => form.fields.find((f) => f.name === name || f.id === name || f.leakedName === name);
const findingIds = (result) => result.findings.map((f) => f.id);
const findingFor = (result, id) => result.findings.find((f) => f.id === id);

module.exports = { withEngine, makeBrowserManager, TEST_LIMITS, formById, field, findingIds, findingFor, fx, REQUIRE_SANDBOX, TEST_ALLOW, TEST_ALLOW_HOSTS };
