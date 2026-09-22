'use strict';

// One Chromium and one egress proxy for the whole process (BUILD-SPEC 6.3, 7, 8).
// The proxy is created BEFORE the browser, because the browser is launched pointing at it.

const { chromium } = require('playwright');
const { createEgressProxy } = require('./egress-proxy');

const RECYCLE_AFTER = 50;

const LAUNCH_ARGS = [
  '--disable-quic',
  // No direct DNS outside the proxy. Loopback stays resolvable for the fixture server.
  '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
  '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
];

// Installed in every frame BEFORE any page script runs. Two layers, both unconditional.
// There is no flag and no switch: a hostile page could flip one.
const SUBMIT_GUARD = `(() => {
  window.addEventListener('submit', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
  HTMLFormElement.prototype.submit = function () {};
  HTMLFormElement.prototype.requestSubmit = function () {};
  // Browser-enforced layer. A page can recover a native submit() from another realm, but it
  // cannot get past its own document's CSP. Policies can be added, never removed.
  const addCsp = () => {
    if (!document.head) return false;
    if (document.head.querySelector('meta[data-fi-csp]')) return true;
    const m = document.createElement('meta');
    m.setAttribute('http-equiv', 'Content-Security-Policy');
    m.setAttribute('content', "form-action 'none'");
    m.setAttribute('data-fi-csp', '1');
    document.head.insertBefore(m, document.head.firstChild);
    return true;
  };
  if (!addCsp()) {
    const mo = new MutationObserver(() => { if (addCsp()) mo.disconnect(); });
    mo.observe(document, { childList: true, subtree: true });
  }
})();`;

const OPEN_SHADOW_ROOTS = `(() => {
  const o = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) { return o.call(this, { ...init, mode: 'open' }); };
})();`;

const REMOVE_WEBRTC = `(() => {
  try { delete window.RTCPeerConnection; } catch (e) { window.RTCPeerConnection = undefined; }
  try { delete window.webkitRTCPeerConnection; } catch (e) { window.webkitRTCPeerConnection = undefined; }
})();`;

function createBrowserManager(config = {}) {
  const requireSandbox = config.requireSandbox !== false;
  const executablePath = config.chromiumPath || undefined;
  const log = config.log || (() => {});

  let browser = null;
  let proxy = null;
  let sandbox = false;
  let inspections = 0;
  let starting = null;

  async function launch() {
    proxy = createEgressProxy({
      testAllow: config.testAllow,
      exclusive: config.egressExclusive === true,
      onBlock: (info) => { if (config.onEgressBlock) config.onEgressBlock(info); },
    });
    const port = await proxy.listen('127.0.0.1', 0);

    const launchOptions = {
      chromiumSandbox: true,
      args: LAUNCH_ARGS,
      executablePath,
      proxy: { server: `http://127.0.0.1:${port}`, bypass: '<-loopback>' },
    };

    try {
      browser = await chromium.launch(launchOptions);
      sandbox = true;
    } catch (error) {
      if (requireSandbox) {
        await proxy.close();
        proxy = null;
        throw new Error(`the Chromium sandbox could not start and FI_REQUIRE_SANDBOX is on: ${error.message}`);
      }
      log({ event: 'sandbox_fallback', level: 'warn',
        message: 'CHROMIUM SANDBOX UNAVAILABLE. Running unsandboxed because FI_REQUIRE_SANDBOX=0. Never do this on a deployment the internet can reach.' });
      browser = await chromium.launch({ ...launchOptions, chromiumSandbox: false });
      sandbox = false;
    }

    browser.on('disconnected', () => { browser = null; });
    inspections = 0;
    log({ event: 'browser_ready', sandbox, version: browser.version() });
    return browser;
  }

  async function ensure() {
    if (browser && browser.isConnected() && inspections < RECYCLE_AFTER) return browser;
    if (browser) await closeBrowser();
    if (!starting) {
      starting = launch().finally(() => { starting = null; });
    }
    return starting;
  }

  async function closeBrowser() {
    const current = browser;
    const currentProxy = proxy;
    browser = null;
    proxy = null;
    if (current) { try { await current.close(); } catch { /* already gone */ } }
    if (currentProxy) { try { await currentProxy.close(); } catch { /* already gone */ } }
  }

  return {
    get proxy() { return proxy; },

    status() {
      if (!browser) return { state: 'idle', sandbox: null };
      return { state: browser.isConnected() ? 'up' : 'down', sandbox };
    },

    async openContext(options = {}) {
      const instance = await ensure();
      inspections += 1;
      const major = String(instance.version()).split('.')[0] || '120';
      const context = await instance.newContext({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
          `Chrome/${major}.0.0.0 Safari/537.36`,
        viewport: { width: 1366, height: 900 },
        locale: 'en-US',
        timezoneId: 'America/New_York',
        serviceWorkers: 'block',
        acceptDownloads: false,
        permissions: [],
        ...options,
      });
      await context.addInitScript(OPEN_SHADOW_ROOTS);
      await context.addInitScript(REMOVE_WEBRTC);
      await context.addInitScript(SUBMIT_GUARD);
      return context;
    },

    async close() { await closeBrowser(); },
  };
}

module.exports = { createBrowserManager, SUBMIT_GUARD, OPEN_SHADOW_ROOTS, REMOVE_WEBRTC, LAUNCH_ARGS, RECYCLE_AFTER };
