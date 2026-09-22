'use strict';

// Entry point: env -> config -> build -> listen. The only place that reads process.env.

const path = require('node:path');
const { loadConfig } = require('./src/config');
const { createStorage } = require('./src/storage');
const { createQueue } = require('./src/queue');
const { createApp } = require('./src/app');
const { createBrowserManager } = require('./lib/browser');
const { inspect } = require('./lib/inspect');

const version = require('./package.json').version;

// One JSON line per event. Never values, cookies or credentials.
function log(entry) {
  process.stdout.write(`${JSON.stringify({ t: new Date().toISOString(), ...entry })}\n`);
}

function main() {
  let config;
  try {
    config = loadConfig(process.env, { log });
  } catch (error) {
    log({ event: 'startup_refused', level: 'error', message: error.message });
    process.exit(1);
    return;
  }

  if (!config.requireSandbox) {
    log({ event: 'sandbox_not_required', level: 'warn',
      message: 'FI_REQUIRE_SANDBOX=0. Never run this on a deployment the internet can reach.' });
  }

  const storage = createStorage({ file: path.join(config.dataDir, 'form-inspector.db') });

  // Crash-only recovery: nothing may sit in a non-terminal state forever.
  const interrupted = storage.failInterrupted(new Date().toISOString());
  if (interrupted) log({ event: 'restart_recovery', failed: interrupted });

  const browserManager = createBrowserManager({
    requireSandbox: config.requireSandbox,
    chromiumPath: config.chromiumPath,
    testAllow: config.testAllow,
    egressExclusive: config.egressExclusive,
    onEgressBlock: ({ host, port, reason }) => log({ event: 'egress_blocked', host, port, reason }),
    log,
  });

  const inspector = {
    inspect: (url, options) => inspect(url, options, {
      browserManager, version,
      testAllowHosts: config.testAllow,
    }),
  };

  const queue = createQueue({ storage, inspector, config, log });
  const app = createApp(config, { storage, queue, browserManager, version });

  const server = app.listen(config.port, config.host, () => {
    log({ event: 'listening', host: config.host, port: config.port, uiEnabled: config.uiEnabled,
      apiKeys: config.apiKeys.length, requireSandbox: config.requireSandbox });
  });

  // Hourly housekeeping: purge finished audits past expiresAt and old idempotency keys.
  const housekeeping = setInterval(() => {
    try {
      const purged = storage.purgeExpired(new Date().toISOString());
      if (purged) log({ event: 'purged', audits: purged });
    } catch (error) {
      log({ event: 'purge_failed', level: 'error', message: error.message });
    }
  }, 3600_000);
  housekeeping.unref();

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log({ event: 'shutting_down', signal });
    queue.stop();
    await queue.drain(10_000);
    server.close();
    await browserManager.close().catch(() => {});
    storage.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => { shutdown('SIGTERM'); });
  process.on('SIGINT', () => { shutdown('SIGINT'); });
}

if (require.main === module) main();

module.exports = { main, log };
