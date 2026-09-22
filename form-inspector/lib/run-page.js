'use strict';

// One load: guards, consent, real input, bounded capture, extraction (BUILD-SPEC section 8).

const { extractInPage } = require('./extract-inpage');
const { sanitizeFrame } = require('./sanitize');
const { parseDefinitionBody } = require('./definitions');
const { findSentinels } = require('./attribution');

const DEFAULT_LIMITS = Object.freeze({
  runTimeoutMs: 45000,
  navigationTimeoutMs: 30000,
  networkIdleTimeoutMs: 12000,
  frameExtractTimeoutMs: 5000,
  wheelStepMs: 250,
  consentSettleMs: 1500,
  maxFrames: 30,
  maxBodiesRead: 150,
  maxBodiesInFlight: 2,
  maxBodyTransferBytes: 512 * 1024,
  maxBodyDecodedBytes: 2 * 1024 * 1024,
  maxDecodedPerRun: 8 * 1024 * 1024,
  maxDefinitionsKept: 40,
  maxDefinitionChars: 3 * 1024 * 1024,
  maxErrors: 10,
});

// Appendix B. Best effort analytics hygiene so test loads pollute client analytics less.
// It is NOT a guarantee. Never a script host: attribution ships through tag managers.
const BEACON_SUBSTRINGS = [
  'google-analytics.com/collect', 'google-analytics.com/g/collect', 'analytics.google.com/g/collect',
  'stats.g.doubleclick.net', 'facebook.com/tr', 'bat.bing.com/action', 'px.ads.linkedin.com',
  'analytics.tiktok.com/api', 'track.hubspot.com/__ptq.gif', '/webevents/visitWebPage',
  'pi.pardot.com/analytics', '.clarity.ms/collect', '.hotjar.com/api', '.hotjar.io',
];
const BEACON_PATTERNS = [/\/g\/collect(\?|$)/, /pi\.pardot\.com\/.*analytics/];

// Appendix C, first visible wins.
const CONSENT_SELECTORS = [
  '#onetrust-accept-btn-handler',
  '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
  '#CybotCookiebotDialogBodyButtonAccept',
  '#hs-eu-confirmation-button',
  '#truste-consent-button',
  '.osano-cm-accept-all',
  '#didomi-notice-agree-button',
  '.cky-btn-accept',
  '#cookie_action_close_header',
  '.cc-allow',
  '[data-cky-tag="accept-button"]',
];
const CONSENT_TEXT = /^(accept all|accept all cookies|allow all|allow all cookies|i agree|agree|accept|got it)$/i;

// Utility widget frames hold inputs but are not forms.
const UTILITY_FRAME_HOSTS = [
  'google.com/recaptcha', 'recaptcha.net', 'hcaptcha.com', 'challenges.cloudflare.com',
  'js.stripe.com', 'googletagmanager.com', 'doubleclick.net', 'youtube.com/embed',
  'player.vimeo.com', 'wistia.net', '/_/service_worker/',
];

const BOT_TITLE = /just a moment|attention required|access denied|verify you are human|pardon our interruption/i;

// The click guard (8.1), evaluated in the page for the resolved element before any click.
const CLICK_GUARD = (el, opts) => {
  const parentOf = (n) => {
    if (!n) return null;
    if (n.parentElement) return n.parentElement;
    const root = n.getRootNode ? n.getRootNode() : null;
    return root && root !== n && root.host ? root.host : null;
  };
  const closestForm = (n) => {
    let node = n;
    let guard = 0;
    while (node && guard++ < 200) {
      if (node.tagName === 'FORM') return node;
      node = parentOf(node);
    }
    return null;
  };

  const inForm = closestForm(el);
  if (inForm) return 'inside a form';
  if (el.hasAttribute && el.hasAttribute('form')) return 'bound to a form by its form attribute';

  const tag = (el.tagName || '').toLowerCase();
  const type = (el.getAttribute ? el.getAttribute('type') || '' : '').toLowerCase();
  if (tag === 'input' && (type === 'submit' || type === 'image')) return 'a submit control';
  if (tag === 'button' && type === 'submit') return 'a submit control';
  if (tag === 'button' && !el.getAttribute('type') && closestForm(el)) return 'a default-submit button in a form';

  if (tag === 'a') {
    const href = el.getAttribute('href');
    if (href) {
      try {
        const target = new URL(href, location.href);
        if (target.origin !== location.origin) return 'a link that leaves this origin';
      } catch (e) { /* not a real url */ }
    }
  }

  // The generic text fallback must additionally sit inside a consent container. A form's own
  // "Agree" submit button must never be taken for a consent button.
  if (opts && opts.requireConsentContainer) {
    const pattern = /cookie|consent|gdpr|privacy|onetrust|cookiebot|osano|didomi|truste|cky|cmp/i;
    let node = el;
    let guard = 0;
    let ok = false;
    while (node && guard++ < 30) {
      const id = node.getAttribute ? node.getAttribute('id') || '' : '';
      const cls = node.getAttribute ? node.getAttribute('class') || '' : '';
      const aria = node.getAttribute ? node.getAttribute('aria-label') || '' : '';
      if (pattern.test(`${id} ${cls} ${aria}`)) { ok = true; break; }
      node = parentOf(node);
    }
    if (!ok) return 'not inside a consent container';
  }
  return null;
};

function isBeacon(url) {
  const lower = url.toLowerCase();
  if (BEACON_SUBSTRINGS.some((needle) => lower.includes(needle))) return true;
  return BEACON_PATTERNS.some((re) => re.test(lower));
}

function isUtilityFrame(url) {
  const lower = String(url || '').toLowerCase();
  return UTILITY_FRAME_HOSTS.some((needle) => lower.includes(needle));
}

function hostOfUrl(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return null; }
}

function originOf(url) {
  try { return new URL(url).origin; } catch { return null; }
}

function withTimeout(promise, ms, onTimeout) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((resolve) => { timer = setTimeout(() => resolve(onTimeout), ms); }),
  ]);
}

async function runPage({ browserManager, url, options = {}, limits: limitOverrides = {}, contextOptions = {} }) {
  const limits = { ...DEFAULT_LIMITS, ...limitOverrides };
  const started = Date.now();
  const errors = [];
  const notes = [];
  const addError = (message) => {
    if (errors.length < limits.maxErrors) errors.push(String(message).slice(0, 200));
  };

  let egressBlocked = 0;
  const context = await browserManager.openContext(contextOptions);
  const previousBlockCounter = browserManager.proxy ? browserManager.proxy.stats().blocked : 0;

  const result = {
    meta: {
      url, finalUrl: null, httpStatus: null, durationMs: 0,
      requestCount: 0, beaconsBlocked: 0, egressBlocked: 0, errors,
    },
    frames: [], definitions: [], cookies: [], notes,
    documentHeaders: null, documentUrl: null, subresourceUrls: [], requestHosts: [],
    consentBannerDetected: false, consentClicked: null,
    botWall: false, mainFrameExtracted: false, clickSelectorNotes: [],
  };

  let page = null;
  const timer = setTimeout(() => { if (page) page.close().catch(() => {}); }, limits.runTimeoutMs);

  try {
    page = await context.newPage();

    // --- wiring -------------------------------------------------------------------
    let beaconsBlocked = 0;
    await context.route('**/*', (route) => {
      const target = route.request().url();
      if (isBeacon(target)) { beaconsBlocked += 1; route.abort().catch(() => {}); return; }
      route.continue().catch(() => {});
    });

    const navigationUrls = new Set([url]);
    let documentCandidate = null;
    const subresourceUrls = [];
    const requestHosts = new Set();

    page.on('request', (request) => {
      result.meta.requestCount += 1;
      const target = request.url();
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
        navigationUrls.add(target);
        return;
      }
      const host = hostOfUrl(target);
      if (host) requestHosts.add(host);
      if (subresourceUrls.length < 400) subresourceUrls.push(target);
    });

    // Top-level document tracking: a response is only a CANDIDATE until framenavigated
    // confirms it. A framenavigated with no candidate is a same-document navigation
    // (pushState, replaceState, hash) and must not change whose headers are reported.
    page.on('response', async (response) => {
      const request = response.request();
      const status = response.status();
      if (request.frame() === page.mainFrame() && request.isNavigationRequest()) {
        navigationUrls.add(response.url());
        const redirect = status >= 300 && status < 400;
        if (!redirect && status !== 204 && status !== 205) {
          documentCandidate = { url: response.url(), status, headers: response.headers() };
        }
        // The proxy refused this navigation. That is our control answering, not the site,
        // and it must never be reported as a bot wall.
        const refusal = response.headers()['x-egress-blocked'];
        if (refusal) result.egressRefusal = String(refusal);
        return;
      }
      await captureDefinition(response).catch(() => {});
    });

    page.on('framenavigated', (frame) => {
      if (frame !== page.mainFrame()) return;
      if (documentCandidate && documentCandidate.url === frame.url()) {
        result.documentHeaders = documentCandidate.headers;
        result.documentUrl = documentCandidate.url;
        result.meta.httpStatus = documentCandidate.status;
        documentCandidate = null;
      }
    });

    page.on('dialog', (dialog) => { dialog.dismiss().catch(() => {}); });
    page.on('popup', (popup) => { popup.close().catch(() => {}); });
    page.on('pageerror', () => { /* a page's own error is not our error */ });

    // --- definition capture (11.3) ------------------------------------------------
    let bodiesRead = 0;
    let inFlight = 0;
    let decodedTotal = 0;
    let definitionChars = 0;

    async function captureDefinition(response) {
      if (bodiesRead >= limits.maxBodiesRead) return;
      if (inFlight >= limits.maxBodiesInFlight) return;
      if (result.definitions.length >= limits.maxDefinitionsKept) return;
      const status = response.status();
      if (status < 200 || status >= 300) return;
      const type = response.request().resourceType();
      if (type !== 'xhr' && type !== 'fetch' && type !== 'script') return;

      const target = response.url();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';
      const isJson = contentType.toLowerCase().includes('json');
      const isMarketo = target.includes('/index.php/form/getForm');
      if (!isJson && !isMarketo) return;

      const declared = Number(headers['content-length']);
      if (Number.isFinite(declared) && declared > limits.maxBodyTransferBytes) return;

      inFlight += 1;
      bodiesRead += 1;
      try {
        const body = await response.text();
        if (body.length > limits.maxBodyDecodedBytes) return;
        decodedTotal += body.length;
        if (decodedTotal > limits.maxDecodedPerRun) return;
        const definition = parseDefinitionBody({ url: target, body, contentType });
        // Everything that does not classify is dropped at once and never stored.
        if (!definition) return;
        const size = JSON.stringify(definition).length;
        if (definitionChars + size > limits.maxDefinitionChars) return;
        definitionChars += size;
        result.definitions.push(definition);
      } catch {
        /* body already gone, or not text */
      } finally {
        inFlight -= 1;
      }
    }

    // --- navigate -----------------------------------------------------------------
    let response = null;
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: limits.navigationTimeoutMs });
    } catch (error) {
      const message = String(error.message || error);
      result.navigationError = /ERR_NAME_NOT_RESOLVED|ENOTFOUND|ERR_NAME_RESOLUTION/i.test(message)
        ? 'dns_failed'
        : /Timeout|timeout/i.test(message) ? 'timeout' : 'navigation_error';
      addError(message);
    }
    if (response && result.meta.httpStatus === null) result.meta.httpStatus = response.status();
    if (response && !result.documentHeaders) {
      result.documentHeaders = response.headers();
      result.documentUrl = response.url();
    }
    result.meta.finalUrl = page.url();

    if (!result.navigationError) {
      try {
        await page.waitForLoadState('networkidle', { timeout: limits.networkIdleTimeoutMs });
      } catch { /* an idle timeout is tolerated */ }

      // --- consent (step 7) -------------------------------------------------------
      await handleConsent(page, options, result, addError, limits);

      // --- real input (step 8) ----------------------------------------------------
      // Sites that "delay JavaScript until user interaction" only load their form embed
      // after a real mousemove, wheel or key event. window.scrollBy does not count.
      try {
        await page.mouse.move(400, 300);
        for (let i = 0; i < 6; i++) {
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(limits.wheelStepMs);
        }
        await page.keyboard.press('Shift');
        await page.mouse.wheel(0, -4000);
        await page.waitForTimeout(Math.min(Math.max(Number(options.waitMs) || 2500, 0), 10000));
      } catch (error) { addError(`real input: ${error.message}`); }

      // --- optional clickSelectors (step 9) ---------------------------------------
      for (const selector of (options.clickSelectors || []).slice(0, 5)) {
        try {
          const locator = page.locator(selector).first();
          const count = await locator.count();
          if (!count) { result.clickSelectorNotes.push(`clickSelector not found: ${selector}`); continue; }
          const rejection = await locator.evaluate(CLICK_GUARD, { requireConsentContainer: false });
          if (rejection) {
            result.clickSelectorNotes.push(`clickSelector rejected: ${rejection}`);
            continue;
          }
          await locator.click({ timeout: 3000 });
        } catch (error) {
          result.clickSelectorNotes.push(`clickSelector failed: ${String(error.message).slice(0, 80)}`);
        }
      }
      if ((options.clickSelectors || []).length) await page.waitForTimeout(limits.consentSettleMs);
    }

    // --- bot wall (step 10) --------------------------------------------------------
    const title = await page.title().catch(() => '');
    const status = result.meta.httpStatus;
    const markerHit = await page.content()
      .then((html) => /cf-chl|px-captcha|captcha-delivery/.test(html))
      .catch(() => false);

    // --- extraction (step 11) ------------------------------------------------------
    const frames = page.frames().slice(0, limits.maxFrames);
    const mainFrame = page.mainFrame();
    const mainOrigin = originOf(mainFrame.url());
    const ordered = [mainFrame, ...frames.filter((f) => f !== mainFrame)];

    for (const frame of ordered) {
      const isMain = frame === mainFrame;
      if (!isMain && isUtilityFrame(frame.url())) continue;
      let json = null;
      try {
        json = await withTimeout(
          frame.evaluate(extractInPage, {
            maxExtractionChars: 3_000_000, valueMax: 2000, maxFieldsPerFrame: 1500,
          }),
          limits.frameExtractTimeoutMs,
          null,
        );
      } catch (error) {
        addError(`frame ${frame.url().slice(0, 80)}: ${String(error.message).slice(0, 100)}`);
      }

      const rebuilt = sanitizeFrame(json);
      if (!rebuilt.ok) {
        addError(`frame ${frame.url().slice(0, 80)}: ${rebuilt.reason}`);
        if (isMain) result.frameErrorOnMain = true;
        continue;
      }
      if (isMain) result.mainFrameExtracted = true;

      let depth = 0;
      let parent = frame.parentFrame();
      while (parent) { depth += 1; parent = parent.parentFrame(); }

      result.frames.push({
        ...rebuilt.frame,
        url: frame.url(),
        isMainFrame: isMain,
        crossOrigin: !isMain && originOf(frame.url()) !== mainOrigin,
        depth,
      });
    }

    const formCount = result.frames.reduce((sum, f) => sum + f.forms.length, 0);
    const botMarkers = result.frames.some((f) => f.botMarkers.length > 0);
    result.botWall = (([403, 429, 503].includes(status) && formCount === 0) ||
      BOT_TITLE.test(title || '') || markerHit || botMarkers);

    // --- cookies (step 13) ---------------------------------------------------------
    try {
      const cookies = await context.cookies();
      for (const cookie of cookies.slice(0, 200)) {
        const keys = findSentinels(cookie.value);
        // Names and domains only. Never a cookie value.
        result.cookies.push({ name: cookie.name, domain: cookie.domain, containsSentinel: keys[0] || null });
      }
    } catch (error) { addError(`cookies: ${error.message}`); }

    result.subresourceUrls = subresourceUrls.filter((u) => !navigationUrls.has(u));
    result.requestHosts = [...requestHosts];
    result.meta.beaconsBlocked = beaconsBlocked;
  } catch (error) {
    addError(String(error.message || error));
    if (!result.navigationError) result.navigationError = 'navigation_error';
  } finally {
    clearTimeout(timer);
    if (browserManager.proxy) {
      egressBlocked = browserManager.proxy.stats().blocked - previousBlockCounter;
    }
    result.meta.egressBlocked = Math.max(0, egressBlocked);
    result.meta.durationMs = Date.now() - started;
    // The context is closed and the slot released here, whatever happened above.
    await context.close().catch(() => {});
  }

  return result;
}

async function handleConsent(page, options, result, addError, limits = DEFAULT_LIMITS) {
  const mode = options.consent === 'ignore' ? 'ignore' : 'accept';
  for (const selector of CONSENT_SELECTORS) {
    try {
      const locator = page.locator(selector).first();
      if (!(await locator.count())) continue;
      if (!(await locator.isVisible().catch(() => false))) continue;
      result.consentBannerDetected = true;
      if (mode === 'ignore') return;
      const rejection = await locator.evaluate(CLICK_GUARD, { requireConsentContainer: false });
      if (rejection) continue;
      await locator.click({ timeout: 3000 });
      result.consentClicked = selector;
      await page.waitForTimeout(limits.consentSettleMs);
      return;
    } catch (error) { addError(`consent ${selector}: ${String(error.message).slice(0, 80)}`); }
  }

  // Generic text fallback. It must ALSO sit inside a consent container.
  try {
    const candidates = page.locator('button, [role=button]');
    const count = Math.min(await candidates.count(), 60);
    for (let i = 0; i < count; i++) {
      const locator = candidates.nth(i);
      if (!(await locator.isVisible().catch(() => false))) continue;
      const text = ((await locator.innerText().catch(() => '')) || '').trim();
      if (!CONSENT_TEXT.test(text)) continue;
      const rejection = await locator.evaluate(CLICK_GUARD, { requireConsentContainer: true });
      if (rejection) continue;
      result.consentBannerDetected = true;
      if (mode === 'ignore') return;
      await locator.click({ timeout: 3000 });
      result.consentClicked = `text:${text}`;
      await page.waitForTimeout(limits.consentSettleMs);
      return;
    }
  } catch (error) { addError(`consent fallback: ${String(error.message).slice(0, 80)}`); }
}

module.exports = {
  runPage, DEFAULT_LIMITS, BEACON_SUBSTRINGS, CONSENT_SELECTORS, CONSENT_TEXT,
  CLICK_GUARD, isBeacon, isUtilityFrame,
};
