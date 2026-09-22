'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { makeBrowserManager, REQUIRE_SANDBOX } = require('./helpers');
const { createBrowserManager } = require('../../lib/browser');

// The first browser test. The sandbox gate is the security-relevant part and is asserted in
// both directions, so this suite is meaningful whether or not the host can sandbox.
test('the browser reports its sandbox state, and the gate holds', async () => {
  const manager = makeBrowserManager();
  try {
    const context = await manager.openContext();
    await context.close();
    const status = manager.status();
    assert.equal(status.state, 'up');
    if (REQUIRE_SANDBOX) {
      assert.equal(status.sandbox, true, 'a sandboxed launch must report sandbox true');
    } else {
      assert.equal(status.sandbox, false, 'the unsandboxed fallback must report sandbox false');
    }
  } finally {
    await manager.close();
  }
});

test('with FI_REQUIRE_SANDBOX on, a browser that cannot sandbox refuses to browse', async (t) => {
  if (REQUIRE_SANDBOX) {
    t.skip('this host sandboxes, so the refusal path cannot be exercised here');
    return;
  }
  const manager = createBrowserManager({
    requireSandbox: true,
    chromiumPath: process.env.FI_CHROMIUM_PATH || undefined,
    log: () => {},
  });
  await assert.rejects(() => manager.openContext(), /sandbox could not start/i);
  assert.deepEqual(manager.status(), { state: 'idle', sandbox: null });
  await manager.close();
});
