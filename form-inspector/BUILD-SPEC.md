# Form Inspector: product build spec (system-agnostic)

Written 2026-09-18. This document specifies a STANDALONE service. It depends on no other
system, agent fleet, database or tool of whoever builds or runs it. Everything a caller needs
is a documented HTTP endpoint (section 14, also served as OpenAPI). Read the whole document
before writing code.

Facts marked VERIFIED were confirmed on real infrastructure and real public pages on that
date. Facts marked VERIFY come from knowledge and must be confirmed by your tests.

A reference implementation of this spec exists (repo `form-inspector`, version 0.1.0): 93 unit
tests and 29 browser tests green, exercised against real public pages. It covers everything
here except section 18 (optional) and the items listed in section 20. Where the reference
implementation and this document disagree on a CONTRACT (sections 5 and 14), this document
wins; on a heuristic, the code that passes the tests wins.

Assets that ship with this spec: `recorded/` (four fixtures recorded from real public pages,
section 16.2).

---

## 0. How to use this document

1. Sections 1 to 4: intent, rules, verified facts, architecture. Do not reopen the decisions in
   4.1; they went through two independent plan checks and an adversarial review. If you find a
   concrete defect, fix it and record it under Deviations in the build report.
2. Sections 5 and 14 are CONTRACTS (result shape, HTTP API). Freeze them in a short
   `docs/CONTRACT.md` inside the repo before writing handlers, together with the module
   interfaces of section 6.1, so parallel work cannot drift.
3. Sections 7 to 13 are the engine. Build in milestone order (section 17); every milestone has
   a gate.
4. Section 18 is optional and removable. Sections 1 to 17 are the deliverable.
5. Finish with the build report in section 22.

## 1. What is being built

A service that takes page URLs and reports, per form on each page:

- every hidden field (true `type=hidden` inputs, CSS-hidden inputs, off-screen inputs), with
  its name, value and how the value got there;
- which form provider renders the form (HubSpot, Marketo, Pardot, Salesforce Web-to-Lead,
  Eloqua, Gravity Forms, Contact Form 7, Typeform, Jotform and others, plus a generic
  fallback);
- deterministic findings about attribution capture: for each UTM parameter and ad click ID,
  whether a field captures it, a field exists but is not being filled, or nothing was
  observed;
- the site stack behind the page, read passively from the same load: edge CDN, hosting
  platform, web server, CMS, frameworks, asset CDNs, tag managers, analytics, ad pixels,
  marketing automation, chat, consent and bot-protection vendors (section 23).

Two uses: auditing one's own lead forms (is attribution wired correctly), and passive reading
of any public page. Both are read-only page loads. Nothing is ever submitted to a live form.

Shape: ONE container, ONE process. REST API, optional web UI, in-process job queue, inspection
engine, SQLite on a volume. Configuration by environment variables only. Callers are
consumers of the API: a script, a CRM, an agent tool wrapper, a dashboard. Nothing in the core
knows who calls it.

### Non-goals

- No LLM calls anywhere. Extraction, fingerprinting and findings are deterministic code.
- No crawling or sitemap discovery. The caller supplies URLs (1 to 50 per audit).
- No exports, notifications, schedulers or webhooks in v1 (polling only; section 20).
- No bot-wall evasion. A blocked page is reported as blocked.
- No live form submission, in any milestone, under any flag.
- No knowledge of any particular caller, tenant model or deployment.

## 2. Hard rules

Safety:

1. Never submit a form on a live site. Live URLs get passive page loads only. Section 18 tests
   run only against the local fixture server.
2. Never type into or change a field whose `hiddenKind` is not null or whose `noise` is not
   null. Honeypots exist to catch exactly that.
3. The inspector never clicks anything inside a form. Every click it performs (consent
   buttons, `clickSelectors`) passes the click guard in section 8.1 first. Every page also
   runs the submit guard from section 8.1, so a stray click cannot natively submit a form.
4. The browser must only ever reach public internet addresses. The egress proxy (section 7)
   is the control. Assume the container sits on a network with databases and admin panels.
5. Chromium runs sandboxed. A deployment reachable from the internet must refuse to browse
   when the sandbox cannot start (`FI_REQUIRE_SANDBOX=1`, the default).
6. The container receives only its own settings. Never mount or pass another system's
   credentials into it.
7. Never log field values, cookie values, passcodes or API keys.
8. No stealth plugins, no fingerprint spoofing beyond the plain Chrome user agent string in
   section 8.
9. Nothing computed INSIDE the inspected page is trusted. The extractor runs in the page's
   own JavaScript realm, where the page can replace any built-in (`slice`, `map`,
   `Object.keys`, `JSON.stringify`). Limits applied in there are a courtesy. The real limits
   are an operator-only length gate on the JSON string that leaves the page and a trusted
   rebuild in Node (section 9.2).
9a. Every string taken from an inspected page is attacker controlled. The web UI builds DOM
   with `textContent` only and ships a strict Content-Security-Policy without inline script.

Engineering:

10. Two dependencies: `express` and `playwright` (exact version, no caret). Storage is Node's
    built-in `node:sqlite`. Pure engine modules have zero dependencies.
11. The Playwright npm version and the Docker image tag must be identical. Resolve the version
    once at build time (`npm view playwright version`), confirm the image tag exists, commit
    the lockfile.
12. The process refuses to start without at least one credential (API key or UI passcode).
13. House style for all text the service emits: plain sentences, no em dashes, finding details
    at most 240 characters.

## 3. Verified facts (2026-09-18)

Runtime and platform:

| Fact | Detail |
|---|---|
| Playwright | npm latest `1.63.0`; image `mcr.microsoft.com/playwright:v1.63.0-noble` exists (so does `-jammy`); it ships Node `v24.20`, npm 11, user `pwuser` (uid 1001), and NO compiler toolchain. Avoid native npm modules |
| SQLite | `node:sqlite` (`DatabaseSync`) works without flags on Node 24. No native dependency needed |
| Playwright on Alpine | unsupported (musl). Use the Playwright image |
| Chromium sandbox in Docker | Needs Playwright's seccomp profile (`https://raw.githubusercontent.com/microsoft/playwright/main/utils/docker/seccomp_profile.json`, answers 200, mentions `unshare`). With Docker's default seccomp profile the sandboxed launch FAILS |
| Capabilities | `cap_drop: ALL` alone KILLS the sandbox ("Zygote process exited prematurely"). `cap_drop: ALL` + `cap_add: SYS_CHROOT` + `no-new-privileges` + the seccomp profile + non-root user WORKS. `SYS_ADMIN` alone does not help. Tested as a matrix |
| Host prerequisite | unprivileged user namespaces must be allowed (`kernel.unprivileged_userns_clone=1`; on Ubuntu also `kernel.apparmor_restrict_unprivileged_userns=0` or an AppArmor exception) |
| `node --test <dir>` | fails on Node 24 ("Cannot find module"). Use globs: `node --test test/unit/*.test.js` |
| Loopback through the proxy | Playwright `proxy: { server, bypass: '<-loopback>' }` does route `127.0.0.1` through the proxy, which the fixture suite relies on |
| Launch flags | `--disable-quic`, `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1` and `--force-webrtc-ip-handling-policy=disable_non_proxied_udp` all coexist with the proxy and the full fixture suite |
| Timing | a real page takes 18 to 35 s for both loads together |

Real-world observations that shaped the design (all public pages):

- HubSpot ships at least three embed generations. `https://www.fluxx.io/demo` serves
  `div.hs-form-html[data-form-id][data-portal-id][data-region]` (CMS-native, renders in the
  page DOM, field names look like `0-1/utm_source`). `https://www.pkisolutions.com/contact/`
  serves `div.hs-form-frame[data-region="na2"][data-form-id][data-portal-id]` (new embed,
  cross-origin iframe, region-specific loader host `js-na2.hsforms.net`) and only renders after
  real user input (section 8, step 8). The legacy definition endpoint
  `https://forms.hsforms.com/embed/v3/form/{portalId}/{formId}/json` answers both forms with
  HTTP 403 "Not an Embed version 2 or 3 form". Consequence: never hardcode a HubSpot
  definition URL; capture by content (section 11.3). For new-editor forms no JSON definition
  was observed at all, so the DOM layer has to stand on its own.
- `https://learn.cisecurity.org/contact-us` is a Pardot landing page. The form is
  `form#pardot-form`, input names are obfuscated (`799323_195052pi_799323_195052`) and the
  real field name leaks through the wrapper class:
  `<div class="form-field utm_source pd-hidden hidden">`. Honeypot `pi_extra_field` sits in
  an absolutely positioned off-screen `<p>`. All five UTM hidden fields are empty in static
  HTML; the probe load showed all five being filled. The page also carries a Cookiebot
  dialog `<form>` and two reCAPTCHA frames with a `recaptcha-token` input (section 10.1).
- `https://skyhope.org/request-a-free-medical-flight/` is a multi-page Gravity Forms form
  (`gform_13`): 24 `type=hidden` inputs, of which 14 are framework state (one of them,
  `partial_entry_id`, is written with an unquoted `type=hidden`, which a naive regex misses
  and the DOM does not), one is Akismet (`ak_js`), and 9 are real data carriers with opaque
  names (`input_98`, `input_108`). One constant holds a `marketingautomation.services`
  postback URL, which identifies the marketing automation vendor (SharpSpring). On the probe
  load `input_108` received the test `gclid`, and `input_103` received the WHOLE landing URL
  with every test value in it (section 12). 57 further fields sit in later form pages
  (section-hidden). Opaque names are why population is detected by value, never by name.

## 4. Architecture

```
any caller (script, CRM, agent tool, dashboard, the bundled web UI)
   | HTTPS through the operator's reverse proxy or tunnel
   v
form-inspector container (one Node process)
   REST API + static web UI      src/app.js        auth, limits, admission, views
   job queue (in process)        src/queue.js      audits in parallel, URLs one at a time
   storage seam                  src/storage.js    node:sqlite file on a volume
   inspection engine             lib/*             baseline + probe loads -> PageResult
        Chromium (sandboxed) -> in-process egress proxy -> public internet only
```

- The engine is a library with one entry point, `inspect(url, options) -> PageResult`. It
  knows nothing about HTTP, storage or callers.
- The API layer stores each `PageResult` verbatim and serves bounded projections of it.
- The spec defines HTTP behavior, not process topology. One process is the default. An
  API/worker split behind the same storage seam is a later scaling step (section 20).

### 4.1 Decisions already made (do not relitigate)

| Decision | Why |
|---|---|
| Standalone service, endpoints as the only interface | It must be usable by any system. Integrations are consumers, never part of the core |
| One container, one process, SQLite | Zero external services for a first deployment; the storage seam keeps Postgres possible |
| Browser in the official Playwright image | Alpine/musl is unsupported; the image carries a matching browser build |
| SSRF control is a validating egress proxy, not `page.route` + DNS pre-check | A pre-check does not bind Chromium's connection to the validated address (DNS rebinding), and routing does not cover every transport. The proxy resolves, validates and connects to the validated IP itself |
| Two loads per URL: baseline then probe, each in a clean context | One load cannot separate constants from URL-driven values from dynamic values |
| Baseline strips attribution parameters, probe replaces them | Otherwise a correctly filled field on a pre-tagged URL reads as a constant and produces a false gap |
| Population detected by sentinel VALUE, not by field name | Salesforce `00N...` ids, Pardot obfuscated names and Gravity Forms `input_N` names are opaque |
| DOM is the primary evidence; provider definitions are enrichment that fails soft | Provider endpoints change (the HubSpot 403 above). Definition-only fields are kept with provenance, because DOM absence does not prove field absence |
| Page-level provider signals never label a form | A search box on a HubSpot site is not a HubSpot form |
| Findings say "not observed", never "missing" | Later steps, logged-in states and submit-time fields are outside the observation scope |
| Findings are deterministic, no LLM | Repeatable, free, testable |
| Opaque string ids, idempotent create, cursor pagination, error envelope | Integrators retry, paginate and parse errors; this must be stable from day one |
| Shared workspace in v1 | One operator, trusted credentials. Ownership scoping comes before mutually untrusted users |
| Polling only, no webhooks in v1 | Durable delivery needs persisted state, signing, retries and SSRF-safe targets. Deferred until an integration needs it |
| Live submit never exists; dry-run submit capture is optional (section 18) | Sealed egress makes zero-leak provable; if the leak tests cannot pass, it is removed and the rest ships |

## 5. Result contract v1

Types are written as TypeScript for precision; the code is plain JS. Every consumer (storage,
API views, web UI, any integration) reads this shape. camelCase everywhere, never re-keyed.
Bump `schemaVersion` on any breaking change.

```ts
type ProviderId =
  | 'hubspot' | 'marketo' | 'pardot' | 'salesforce_w2l' | 'eloqua'
  | 'gravity_forms' | 'cf7' | 'wpforms' | 'ninja_forms' | 'formidable' | 'elementor'
  | 'typeform' | 'jotform' | 'google_forms' | 'mailchimp' | 'klaviyo' | 'activecampaign'
  | 'dynamics' | 'zoho' | 'unbounce' | 'webflow' | 'formstack' | 'sharpspring' | 'calendly' | 'generic';

type Outcome = 'ok' | 'partial' | 'empty' | 'blocked' | 'failed';
type OutcomeReason =
  | null | 'no_forms' | 'bot_wall' | 'address_not_allowed'
  | 'dns_failed' | 'timeout' | 'http_error' | 'navigation_error'
  | 'frame_errors' | 'limits_hit' | 'probe_failed' | 'probe_unmatched'
  | 'embed_not_rendered';

interface InspectRequest {
  url: string;
  options?: {
    probe?: boolean;                 // default true
    consent?: 'accept' | 'ignore';   // default 'accept'
    waitMs?: number;                 // default 2500, clamp 0..10000
    clickSelectors?: string[];       // max 5, each <= 200 chars; must pass the click guard (8.1); not allowed with submitCapture
    submitCapture?: { formIndex: number } | null;  // M6 only; rejected with 400 until M6 ships
  };
}

interface PageResult {
  schemaVersion: 1;
  requestedUrl: string;
  finalUrl: string | null;           // baseline run's final URL
  outcome: Outcome;
  outcomeReason: OutcomeReason;
  outcomeDetail: string | null;      // one human-readable line
  httpStatus: number | null;
  scope: {
    consentMode: 'accept' | 'ignore';
    consentBannerDetected: boolean;
    consentClicked: string | null;   // selector that was clicked
    probe: boolean;
    clickSelectors: string[];
    note: string;                    // fixed text, see section 13.4
  };
  runs: { baseline: RunMeta; probe: RunMeta | null };
  providers: ProviderHit[];          // page level, deduped, best confidence first
  enrichmentVendors: string[];       // 'zoominfo' | 'clearbit' | '6sense' | 'demandbase'
  cookies: CookieNote[];             // names only, from the probe run (baseline if no probe)
  forms: FormResult[];
  stack: SiteStack | null;           // section 23; null when the baseline load failed
  unmatchedDefinitions: DefinitionResult[];
  findings: Finding[];
  limits: { truncated: boolean; notes: string[] };
  timings: { totalMs: number };
  inspectedAt: string;               // ISO 8601
  inspectorVersion: string;          // service package.json version
}

interface StackHit { name: string; confidence: 'high' | 'medium'; evidence: string[]; }   // <= 3 evidence strings, each <= 120 chars
interface SiteStack {
  edgeCdn: StackHit[];     // CDN / WAF in front of the MAIN document, from its response headers
  assetCdn: StackHit[];    // third-party CDNs that served subresources. Never the site's edge
  hosting: StackHit[]; server: StackHit[]; cms: StackHit[]; frameworks: StackHit[];
  tagManagers: StackHit[]; analytics: StackHit[]; advertising: StackHit[]; marketing: StackHit[];
  chat: StackHit[]; consent: StackHit[]; security: StackHit[];          // each list <= 12 hits
  observed: { headers: Record<string, string>;   // allow-listed header values, each <= 120 chars
              headerFlags: string[];             // headers that carry ids: presence only, never the value
              fromLoad: 'baseline' };
}

interface RunMeta {
  url: string; finalUrl: string | null; httpStatus: number | null;
  durationMs: number; requestCount: number; beaconsBlocked: number;
  egressBlocked: number;             // connections refused by the egress proxy
  errors: string[];                  // max 10, each <= 200 chars
}

interface ProviderHit { provider: ProviderId; confidence: 'high' | 'medium' | 'low'; evidence: string[]; }

interface CookieNote { name: string; domain: string; containsSentinel: string | null; } // param name or null

interface FormResult {
  formIndex: number;                 // stable within this PageResult, baseline order
  frame: { url: string; isMainFrame: boolean; crossOrigin: boolean; depth: number;
           paramsForwardedToFrame: boolean | null };   // null for main frame or no probe
  inShadowDom: boolean;
  pseudoForm: boolean;               // true when built from inputs that sit outside any <form>
  selector: string;                  // best-effort CSS path, <= 200 chars
  attrs: { id: string | null; name: string | null; className: string | null;
           action: string | null; method: string | null };
  provider: ProviderHit;
  providerFormId: string | null;
  kind: 'lead' | 'newsletter' | 'search' | 'login' | 'other';
  kindReason: string;
  visible: boolean;
  probeMatched: boolean | null;      // null when probe did not run
  fields: FieldResult[];
  definition: DefinitionResult | null;
  coverage: Record<AttributionKey, CoverageState> | null;  // null for search/login forms
  counts: { fields: number; typeHidden: number; cssHidden: number; offscreen: number;
            sectionHidden: number;   // hidden by a step or conditional block; NOT in cssHidden/offscreen
            noise: number };         // all hidden counts exclude noise fields
  truncated: boolean;
  submitCapture?: { status: 'captured' | 'incomplete'; endpoint: string | null;   // M6 only
                    method: string | null; keys: string[]; note: string | null };
}

type AttributionKey =
  | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content'
  | 'gclid' | 'gbraid' | 'wbraid' | 'msclkid' | 'fbclid' | 'li_fat_id' | 'ttclid';
type CoverageState = 'captured' | 'present_not_populating' | 'not_observed' | 'unknown';

interface FieldResult {
  source: 'dom' | 'definition' | 'js_api' | 'payload';   // 'payload' only exists in M6
  tag: 'input' | 'select' | 'textarea' | null;           // null for non-dom sources
  type: string | null;
  name: string | null;
  id: string | null;
  label: string | null;              // <= 120 chars
  leakedName: string | null;         // real field name recovered from markup (Pardot wrapper class)
  required: boolean;
  hiddenKind: 'type_hidden' | 'css_hidden' | 'offscreen' | null;
  hiddenBy: 'self' | 'wrapper' | 'section' | null;
  noise: null | 'csrf' | 'framework_state' | 'captcha' | 'honeypot' | 'antispam' | 'provider_context' | 'unnamed';
  baselineValue: string | null;      // ONLY for fields with hiddenKind != null; else null
  probeValue: string | null;
  valueTruncated: boolean;           // stored values are cut at 300 chars (test values are
                                     // detected on up to 2000 chars BEFORE the cut)
  population: 'url_param' | 'constant' | 'dynamic' | 'empty' | 'unknown';
  populatedFrom: AttributionKey | null;   // first key found
  populatedKeys: AttributionKey[];         // every key whose test value the field held; more than one
                                           // means the field stores the landing URL, not a single value
  populationEvidence: 'load' | 'submit' | null;   // 'submit' only exists in M6
  probeOnly: boolean;                // the field exists only on the probe load
  payloadValue: string | null;       // M6 only, and only for hidden-kind or payload-only fields
  matchedKey: AttributionKey | null; // name/label/leakedName/definition alias match, independent of population
  definitionInfo: { hidden: boolean | null; defaultValue: string | null;
                    autofill: { channel: string; selector: string | null } | null } | null;
}

interface DefinitionResult {
  provider: ProviderId;
  sourceUrl: string;                 // origin + path only, query dropped
  providerFormId: string | null;
  parseStatus: 'ok' | 'partial' | 'failed';
  truncated: boolean;
  fields: Array<{ name: string; label: string | null; fieldType: string | null;
                  hidden: boolean | null; defaultValue: string | null; required: boolean | null;
                  autofill: { channel: string; selector: string | null } | null }>;
}

interface Finding {
  id: 'UTM_COVERAGE' | 'CLICK_ID_COVERAGE' | 'HIDDEN_CONSTANTS' | 'SENSITIVE_HIDDEN_VALUE'
    | 'HONEYPOT_PRESENT' | 'ENRICHMENT_VENDOR' | 'NATIVE_TRACKING' | 'FORM_IN_CROSS_ORIGIN_IFRAME'
    | 'CONSENT_GATED' | 'PAGE_BLOCKED' | 'NO_FORMS_FOUND' | 'EMBED_NOT_RENDERED';
  severity: 'info' | 'review' | 'gap';
  formIndex: number | null;          // null for page-level findings
  title: string;                     // <= 80 chars
  detail: string;                    // <= 240 chars, plain sentence, no em dashes
  evidence: Record<string, unknown>; // small, JSON-safe
}
```

Password input values are never read. Values of visible fields are never read. Values are
read only from fields the extractor classified as hidden.

## 6. The service: layout, container, configuration, limits

### 6.1 File layout and module seams

```
form-inspector/
  Dockerfile, docker-compose.yml, seccomp_profile.json, .env.example, README.md
  package.json                # deps: express, playwright (exact). Test scripts use globs
  server.js                   # entry: env -> config -> build -> listen; restart recovery; shutdown
  docs/CONTRACT.md            # frozen seams (API, PageResult, raw shapes, module interfaces)
  src/config.js               # every env var, limits, credential checks
  src/storage.js              # storage seam on node:sqlite (section 14.7)
  src/auth.js                 # bearer keys, UI session cookie, CSRF, trusted client IP
  src/limits.js               # sliding-window counters with atomic multi-check reserve()
  src/queue.js                # audit runner, rollup summary
  src/views.js                # summary | hidden | full projections
  src/app.js                  # express app: createApp(config, deps), routes, error envelope
  src/openapi.json            # OpenAPI 3.1, exactly the shipped endpoints
  lib/address-policy.js       # isPublicAddress(ip)
  lib/egress-proxy.js         # createEgressProxy(opts) -> { listen, close, seal, stats }
  lib/attribution.js          # keys, sentinels, buildRunUrls, findSentinel(s), matchKey
  lib/noise.js                # classifyNoise(field)
  lib/definitions.js          # parseDefinitionBody, definitionsFromEmbedContainers, correlateDefinitions
  lib/browser.js              # one Chromium + one egress proxy; openContext(); sandbox gate
  lib/run-page.js             # one load: guards, consent, real input, capture, extract
  lib/extract-inpage.js       # the function evaluated inside every frame (section 9)
  lib/providers.js            # fingerprints, Pardot name recovery, page providers
  lib/diff.js                 # baseline vs probe merge, population, form kind
  lib/findings.js             # coverage + deterministic findings
  lib/stack.js                # passive site-stack catalog + detectStack + pickHeaders (section 23)
  lib/sanitize.js             # TRUST BOUNDARY: rebuilds and bounds everything that left the page (9.2)
  lib/inspect.js              # inspect(url, options) -> PageResult; global page-load slots
  public/index.html, app.js, styles.css     # web UI, no framework, no inline script
  test/unit/*.test.js         # pure modules + API (fake inspector), run on the host
  test/browser/*.test.js      # fixture-backed engine tests, run inside the image
  test/fixtures/server.js     # multi-origin fixture server
  test/recorded/              # recorded real-world forms
  deploy/                     # reverse-proxy or tunnel helpers (operator specific, optional)
```

`src/app.js` exports `createApp(config, deps)` and `server.js` only wires env to config when
run as the entry point, so tests inject storage, a fake inspector and config without touching
`process.env`. The five pure modules (`address-policy`, `egress-proxy`, `attribution`,
`noise`, `definitions`) have exact signatures in `docs/CONTRACT.md`; they are a clean unit of
work to hand to a second developer or agent in parallel.

### 6.2 Dockerfile and compose (VERIFIED working)

```dockerfile
# The image tag and the playwright version in package.json MUST be identical.
FROM mcr.microsoft.com/playwright:v<RESOLVED_VERSION>-noble
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /data && chown -R pwuser:pwuser /data /app
USER pwuser
ENV FI_DATA_DIR=/data FI_PORT=3011 NODE_OPTIONS=--max-old-space-size=1024
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3011/api/v1/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "server.js"]
```

```yaml
name: form-inspector
services:
  form-inspector:
    build: .
    container_name: form-inspector
    restart: unless-stopped
    init: true
    shm_size: "1gb"
    mem_limit: 3g
    pids_limit: 600
    # The app listens on 0.0.0.0 INSIDE the container. Only host loopback is published:
    # the operator's reverse proxy or tunnel terminates TLS and forwards to it.
    ports:
      - "127.0.0.1:${FI_HOST_PORT:-3011}:3011"
    env_file: [.env]            # THIS service's settings only
    environment: [NODE_ENV=production]
    volumes: [fi-data:/data]
    cap_drop: [ALL]
    cap_add: [SYS_CHROOT]       # the Chromium namespace sandbox needs it in the bounding set
    security_opt:
      - no-new-privileges:true
      - seccomp:./seccomp_profile.json
volumes:
  fi-data:
```

### 6.3 Chromium sandbox

Launch with `chromiumSandbox: true`. The combination in 6.2 is verified. If the sandboxed
launch fails: with `FI_REQUIRE_SANDBOX=1` (default) the browser stays `down`, inspections fail
with a clear reason and `/health` shows `sandbox: false`; with `FI_REQUIRE_SANDBOX=0` fall back
to an unsandboxed launch with a loud log line. Never run `0` on a deployment the internet can
reach. The first browser test asserts `sandbox === true`.

### 6.4 Configuration (environment only)

| Variable | Default | Meaning |
|---|---|---|
| `FI_API_KEYS` | none | `name:secret,name2:secret2`; secrets at least 16 characters |
| `FI_UI_PASSCODE` | none | enables the web UI; at least 8 characters. One of these two is required |
| `FI_SESSION_SECRET` | random per boot | signs UI session cookies; set it so sessions survive restarts |
| `FI_SESSION_HOURS` | 12 | UI session lifetime |
| `FI_COOKIE_SECURE` | 1 | `Secure` + `__Host-` cookie prefix. `0` only for plain http on localhost |
| `FI_REQUIRE_SANDBOX` | 1 | refuse to browse without the Chromium sandbox |
| `FI_PORT` / `FI_HOST` | 3011 / 0.0.0.0 | listen address inside the container |
| `FI_DATA_DIR` | ./data | where the SQLite file lives |
| `FI_RETENTION_DAYS` | 14 | finished audits are purged after this |
| `FI_CLIENT_IP_HEADER` | cf-connecting-ip | single-IP header set by the operator's proxy |
| `FI_TRUSTED_PROXY_CIDRS` | 127.0.0.0/8,::1/128,172.16.0.0/12 | the header counts only when the socket peer is inside these networks (Docker's bridge gateway is the peer when the proxy runs on the host) |
| `FI_UI_MAX_URLS`, `FI_UI_AUDITS_PER_HOUR`, `FI_UI_URLS_PER_HOUR` | 5, 6, 20 | UI principal limits, keyed by client IP |
| `FI_KEY_AUDITS_PER_HOUR`, `FI_KEY_URLS_PER_HOUR` | 60, 300 | per API key (max 50 URLs per audit) |
| `FI_GLOBAL_URLS_PER_DAY` | 500 | whole-instance page budget, computed from storage |
| `FI_MAX_QUEUED_AUDITS`, `FI_MAX_ACTIVE_AUDITS`, `FI_MAX_CONCURRENT_INSPECTIONS` | 10, 2, 2 | queue and concurrency |
| `FI_LOGIN_PER_MINUTE` | 5 | sign-in attempts per client IP, plus a constant 1 s answer delay |
| `FORM_INSPECTOR_TEST_ALLOW` | none | loopback `host:port` allow list for the fixture suite. Honored ONLY when `NODE_ENV=test`; ignored with a warning otherwise |

### 6.5 Limits

| Limit | Default |
|---|---|
| Concurrent page loads (global) | 2 |
| Hard timeout per run (one load + extraction) | 45 s; the context is closed and the slot released in `finally` |
| Probe skipped when the baseline already used | 70 s |
| Navigation timeout / networkidle wait | 30 s / 12 s, idle timeout tolerated |
| Frames per run / forms per page / fields per form | 30 / 50 / 400 |
| Value handed over by the page / value stored | 2000 / 300 characters |
| JSON one frame may hand out of the page | 3 MB of characters, gated in the page with plain operators and checked again in Node before parsing |
| Characters of field data KEPT per frame after the trusted rebuild | 1.2 million (count limits alone would still allow several MB of maximum-length strings). Hitting it marks the form truncated and adds a note |
| Response bodies READ per run | 150, at most 2 in flight, only xhr/fetch/script, only 2xx |
| Body size gate | `content-length`, else `request.sizes().responseBodySize`, at most 512 KB; decoded body at most 2 MB; 8 MB decoded per run |
| Definitions KEPT per run | 40 |
| Page-controlled strings | bounded AT THE SOURCE in the in-page extractor: names and ids 200, class tokens 60, labels 120, data attribute values 200, input type 30; at most 1500 fields per frame. Definition strings are bounded when a definition is kept (names and labels 200, defaults 300, 400 fields) |
| Serialized PageResult | 1.5 MB, ENFORCED: a loop of cuts, each followed by a size check (shorten definitions, drop irrelevant visible fields, drop section-hidden fields, drop plumbing and shorten values, keep 60 fields per form, keep 10 forms, drop field lists, drop forms). The last step always fits. A cut result becomes `partial`/`limits_hit` and every cut is named in `limits.notes`. VERIFIED: an earlier version cut once and never re-measured, and a single hidden field with a huge name survived at 2 MB |
| Request body | 64 KB |
| Browser recycle | after 50 inspections or on `disconnected` |

Every limit that fires adds a line to `limits.notes`. Known residual risk: a decompression
bomb is bounded by transfer size, not by decoded size, until the body is read; the process
memory cap and crash-only recovery (section 14.6) are the backstop.

## 7. Egress proxy (the SSRF control)

Chromium is launched with `proxy: { server: 'http://127.0.0.1:<port>', bypass: '<-loopback>' }`.
`<-loopback>` removes Chromium's implicit proxy bypass for localhost, so loopback traffic
also goes through the proxy and gets judged. The proxy listens on `127.0.0.1` on an
ephemeral port inside the container and is created before the browser.

Behavior:

1. **CONNECT** (`https`, `wss`, and `ws`): parse `host:port` (handle `[v6]:port`). Resolve
   with `dns.promises.lookup(host, { all: true, verbatim: true })` unless the host is an IP
   literal. Reject when the port is not in `{80, 443, 8080, 8443}`, when DNS returns
   nothing, or when ANY returned address is non-public (a mixed answer is a rebinding
   attempt). Otherwise `net.connect` to the FIRST validated address BY IP, then answer
   `200 Connection Established` and pipe both ways. The validated address is the one
   connected to; the hostname is never resolved a second time.
2. **Plain HTTP** (absolute-URI requests): same validation, then `http.request` to the
   validated IP with the original `Host` header (`setHost: false`), hop-by-hop headers
   (`proxy-connection`, `proxy-authorization`) removed, body piped through.
3. Rejections answer `403` with `X-Egress-Blocked: <reason>` and call `onBlock({ host,
   port, reason })` so the run can count `egressBlocked`.
4. `seal()`: refuse every new connection and destroy every tracked socket. Used only by M6.
5. Dependency injection for tests: `createEgressProxy({ lookup, allowPorts, testAllow,
   onBlock })`. `testAllow` is a `Set` of exact `host:port` strings that skip validation.
   `src/config.js` builds it from `FORM_INSPECTOR_TEST_ALLOW` ONLY when
   `NODE_ENV === 'test'`; in any other mode the variable is ignored and a warning is logged.

`isPublicAddress(ip)` uses `net.BlockList`. Non-public (rejected) ranges:

- IPv4: `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10` (CGNAT, this is also the Tailscale
  range), `127.0.0.0/8`, `169.254.0.0/16` (link-local and cloud metadata), `172.16.0.0/12`
  (Docker networks live here), `192.0.0.0/24`, `192.0.2.0/24`, `192.168.0.0/16`,
  `198.18.0.0/15`, `198.51.100.0/24`, `203.0.113.0/24`, `224.0.0.0/4`, `240.0.0.0/4`.
- IPv6: `::/128`, `::1/128`, `fc00::/7`, `fe80::/10`, `ff00::/8`, `2001:db8::/32`.
  IPv4-mapped (`::ffff:0:0/96`) and NAT64 (`64:ff9b::/96`) addresses are unwrapped to IPv4
  and re-checked.

Additional browser hardening (belt and braces; each is VERIFY, drop one only if it breaks the
fixture suite and report it):

- Launch args: `--disable-quic`,
  `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1` (no direct DNS outside the
  proxy), `--force-webrtc-ip-handling-policy=disable_non_proxied_udp`.
- Init script in every frame removes `RTCPeerConnection` and `webkitRTCPeerConnection`.
- Context options: `serviceWorkers: 'block'`, `acceptDownloads: false`, no permissions.
  Dialogs are dismissed, popups are closed.
- `inspect.js` pre-validates the top-level host with the same policy so the caller gets a
  clean `failed`/`address_not_allowed` result instead of a tunnel error. The proxy
  remains the enforcement point; redirects and subresources are covered only by it.

## 8. Inspection pipeline

`inspect(url, options)`:

1. Validate scheme (`http:`/`https:` only) and pre-validate the host (section 7).
2. **Baseline run**: `runPage(baselineUrl)`. `baselineUrl` = the requested URL with all 12
   attribution keys REMOVED from its query string (other parameters and the hash are kept).
   A baseline must be a load with no attribution on it, otherwise a correctly filled field
   looks like a constant.
3. If baseline outcome is `failed` or `blocked`, or `options.probe === false`: skip probe.
4. **Probe run**: `runPage(probeUrl)` in a NEW context. `probeUrl` = `baselineUrl` plus all
   12 sentinel parameters. Every key is therefore always tested. When the requested URL
   carried attribution parameters, add the note `attribution parameters on the requested
   URL were removed for baseline and replaced for probe` to `limits.notes` (a note only; it
   does not make the outcome partial).
5. Merge with `diff.js`, fingerprint, parse definitions, compute findings, assemble and
   size-check the `PageResult`.

Sentinel parameters (value = `fitest-` + key with underscores turned into hyphens):

```
utm_source=fitest-utm-source   utm_medium=fitest-utm-medium   utm_campaign=fitest-utm-campaign
utm_term=fitest-utm-term       utm_content=fitest-utm-content
gclid=fitest-gclid   gbraid=fitest-gbraid   wbraid=fitest-wbraid   msclkid=fitest-msclkid
fbclid=fitest-fbclid   li_fat_id=fitest-li-fat-id   ttclid=fitest-ttclid
```

A field "contains a sentinel" when its value, URL-decoded once and lowercased, contains the
sentinel string. Substring, not equality: values get wrapped (`_fbc` becomes
`fb.1.<ts>.fitest-fbclid`).

`runPage(url)`:

1. New context: `userAgent` = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML,
   like Gecko) Chrome/<major>.0.0.0 Safari/537.36` with `<major>` from `browser.version()`;
   viewport 1366x900; locale `en-US`; timezone `America/New_York`; options from section 7.
2. `context.addInitScript` with: (a) force open shadow roots,
   `const o = Element.prototype.attachShadow; Element.prototype.attachShadow = function (init) { return o.call(this, { ...init, mode: 'open' }); };`
   (b) the WebRTC removal, (c) the submit guard from 8.1.
3. `context.route('**/*')`: abort requests that match the beacon list (Appendix B), count
   them, `continue()` everything else. This is BEST EFFORT analytics hygiene so test loads
   pollute client analytics less. It is not a guarantee and the README must say so. Never
   block script or document loads: attribution scripts commonly ship through tag managers.
4. Listeners: `response` (definition capture, section 11.3, and top-level document
   candidates), `framenavigated` (promotes a candidate to THE committed document),
   `request` (host list, count; hosts of top-level navigations and their redirect hops are
   kept out of the separate SUBRESOURCE host list), `dialog` (dismiss), `popup` (close).
   Top-level document tracking (needed by section 23): a non-3xx, non-204/205 main-frame
   navigation response is only a candidate. It becomes the current document when
   `framenavigated` fires for the main frame with the same URL. A `framenavigated` without a
   candidate is a same-document navigation (pushState, replaceState, hash): the document and
   its headers stay. At extraction the headers are used only if their origin equals the
   page's origin. VERIFIED by fixtures: a redirect hop, a subframe, a 204 navigation and a
   history API rewrite never change whose headers are reported; a 403 bot wall keeps its own.
5. `page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })`. Record status.
   Navigation errors map to `failed` with `dns_failed`, `timeout` or `navigation_error`.
   Main document status >= 400 without a bot-wall signature maps to `failed`/`http_error`
   only when no form is found; if forms render anyway, keep going.
6. `waitForLoadState('networkidle', { timeout: 12000 })`, swallow the timeout.
7. Consent, when mode is `accept`: try the selectors in Appendix C in the main frame, click
   the first visible one THAT PASSES THE CLICK GUARD (8.1), wait 1500 ms, record
   `consentBannerDetected` and `consentClicked`. In `ignore` mode still record whether a
   banner selector was visible.
8. Real input, not script scrolling: move the mouse, then six `mouse.wheel` steps 250 ms
   apart, press `Shift`, then scroll back to top and wait `waitMs`. VERIFIED: sites that
   "delay JavaScript until user interaction" (common WordPress optimizers) only load their
   form embed after a mousemove, wheel or key event. `window.scrollBy` does not count. A
   HubSpot iframe embed on a real page rendered only after this change.
9. Optional `clickSelectors`: for each, in order, resolve the element, apply the click
   guard (8.1), and click only if it passes (3 s timeout each). A rejected or missing
   selector adds a note (`clickSelector rejected: inside a form` and so on) and is skipped.
   Then wait 1500 ms.
10. Bot wall: main status in `{403, 429, 503}` AND zero forms, OR title matches
    `/just a moment|attention required|access denied|verify you are human|pardon our interruption/i`,
    OR the document contains `cf-chl`, `px-captcha` or `captcha-delivery`. Result:
    `blocked`/`bot_wall`. Extraction still runs.
11. Extraction: skip child frames whose URL is a known utility widget (reCAPTCHA, hCaptcha,
    Turnstile, Stripe, tag manager, video players): they hold inputs but are not forms. For
    every other frame in `page.frames()` (cap 30, main frame first), run
    `frame.evaluate(extractInPage, limits)` raced against a 5 s timer. A frame that throws or
    times out adds a note and sets `partial`/`frame_errors`. Cross-origin frames work the
    same way through Playwright; record `crossOrigin` by comparing the frame origin with the
    main frame origin, and `depth` by walking `parentFrame()`.
12. JS API probes, in every frame, inside try/catch:
    `typeof MktoForms2 !== 'undefined' ? MktoForms2.allForms().map(f => ({ id: String(f.getId()), names: Object.keys(f.getValues() || {}) })) : null`.
    NAMES ONLY. The value map never leaves the page: it would carry visible-field values,
    which the contract in section 5 forbids reading.
13. Cookies: `context.cookies()`, keep `name`, `domain`, and which sentinel (if any) the
    value contains. Never keep cookie values.
14. Close the context in `finally`.

Run hard timeout (45 s): if it fires before the main frame was extracted, the run is
`failed`/`timeout`. If the main frame is already extracted, return what was collected as
`partial`/`limits_hit` with a note naming the frames that were skipped.

### 8.1 Click guard and submit guard

**Click guard** (evaluated in the page for the resolved element, before any click the
inspector performs). Reject the click when ANY of these is true:

- the element is inside a `<form>` (`el.closest('form')`, crossing shadow hosts with the
  `parentOf` walk from section 9), or has a `form` attribute;
- the element is `input[type=submit|image]`, `button[type=submit]`, or a `button` with no
  `type` attribute whose ancestors include a form;
- the element is an `<a>` whose `href` leaves the current origin (a click must not navigate
  the inspection away).

For the GENERIC text fallback in Appendix C only, additionally require that the element sits
inside a container whose `id`, `class` or `aria-label` matches
`/cookie|consent|gdpr|privacy|onetrust|cookiebot|osano|didomi|truste|cky|cmp/i`. A form's
own "Agree" or "Accept" submit button must never be taken for a consent button.

**Submit guard** (init script, every frame, installed before any page script runs). Two
layers, both UNCONDITIONAL. There is no flag, no switch, nothing a page could flip:

```js
(() => {
  window.addEventListener('submit', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
  HTMLFormElement.prototype.submit = function () {};
  HTMLFormElement.prototype.requestSubmit = function () {};
  // Browser-enforced layer. A page can recover a native submit() from another realm (a fresh
  // iframe), but it cannot get past its own document's CSP. Policies can be added, never removed.
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
  if (!addCsp()) { const mo = new MutationObserver(() => { if (addCsp()) mo.disconnect(); }); mo.observe(document, { childList: true, subtree: true }); }
})();
```

VERIFIED: an earlier design kept a `window.__fiAllowSubmit` opt-in for section 18. A hostile
page can set such a flag itself and call the saved native method, so it was removed. The
fixture G04 sets the old flag, calls `form.submit()`, borrows
`iframe.contentWindow.HTMLFormElement.prototype.submit` and dispatches a synthetic submit
event; the collector must stay at zero. A page that auto-submits a form on load is held in
place; that is intended. Section 18, if ever built, must use contexts created WITHOUT this
guard rather than a page-visible switch.

## 9. In-page extraction (`lib/extract-inpage.js`)

One self-contained function (no closures over Node scope) that returns RAW FACTS. All
classification happens in Node where it is unit-testable.

Collection:

- `deepQueryAll(root, selector)`: `root.querySelectorAll(selector)` plus recursion into
  every `el.shadowRoot` found under `root`.
- Forms = `deepQueryAll(document, 'form')`. Fields of a form = union (by identity) of
  `deepQueryAll(form, 'input, select, textarea')` and `form.elements` (catches fields bound
  with the `form="id"` attribute).
- Orphans = fields that belong to no form. Group them by the closest ancestor matching
  `[role=form], .hs-form, .mktoForm, [class*="form" i]`; ungrouped orphans form one group per
  frame. Emit a group as a pseudo-form only when it holds at least one hidden-kind field or
  one `type=email` input. Set `pseudoForm: true`.
- Parent walking crosses shadow boundaries:
  `parentOf(n) = n.parentElement || (n.getRootNode() instanceof ShadowRoot ? n.getRootNode().host : null)`.

Per form, return: `attrs`, `selector`, `inShadowDom`, `visible`, class list, and fields.
Per field, return: `tag`, `type`, `name`, `id`, `required`, `autocomplete`, `tabindex`,
`ariaHidden`, `label` (first of: `el.labels[0].innerText`, `aria-label`, text of
`aria-labelledby`, `placeholder`; trimmed to 120), `wrapperClasses` (class lists of up to 3
ancestors), `hiddenKind`, `hiddenBy`, `value` and `checked`. `value` is returned ONLY when
`hiddenKind` is not null, never for `type=password`, cut at `valueMax` (2000 characters, long
enough to see every test value inside a stored landing URL) with a flag.

Also return, per frame: `iframes` (src, id, class), `embedContainers` (elements matching
`[data-form-id][data-portal-id], .hs-form-frame, .hs-form-html, [data-tf-widget], [data-tf-live], [data-tf-hidden], [data-tf-transitive-search-params], [data-form-block-id]`
with their `data-*` attributes), `scripts` (src of every `script[src]`, cap 200),
`globals` (`typeof` of `hbspt`, `MktoForms2`, `piTracker`, `_elqQ`, `gform`, `JotForm`),
`title`, a 300 character body text sample and `botMarkers` (challenge-page markers found in
the DOM) for bot-wall detection.

### 9.1 Hidden classification (get this exactly right)

Form visibility first: `formVisible` is false when the form element or any ancestor has
`display: none`, `visibility: hidden|collapse`, opacity 0, the `hidden` attribute, or the
form's bounding rect is 0x0.

For a field `el` in form `F` (for pseudo-forms, `F` is the group container):

1. `input[type=hidden]` gives `type_hidden` / `self`. Done.
2. Build the chain `[el, parent, ..., up to but excluding F]`.
3. `display: none`, opacity 0 and the `hidden` attribute are NOT inherited in computed
   style: take the NEAREST chain node that has one. `visibility` IS inherited: take the
   TOPMOST chain node whose computed visibility is `hidden` or `collapse`. If the form
   itself is not visible, skip the visibility test and the off-screen test entirely and add
   the note `form not visible; field visibility judged by display only`.
4. Off-screen (only when `formVisible`): position `absolute` or `fixed` AND (rect right < 0
   OR rect bottom < 0 OR document-relative left < -500 OR top < -500), or a box of at most
   1x1 px with `overflow: hidden`.
5. The node found is the origin. `hiddenBy` = `self` when the origin is `el`; otherwise
   count fields under the origin: 3 or fewer gives `wrapper`, more gives `section`.
   `section` means "probably a later step or a conditional block", lower confidence.
6. **Custom-control exemption**: for `input[type=checkbox|radio|file]` and `select`, ignore
   a `self` origin. Styled controls routinely hide the native element and show a styled
   stand-in. These only count as hidden when a wrapper or section hides them.

### 9.2 Trust boundary (`lib/sanitize.js`)

The in-page function builds its result, serializes it, and returns the JSON STRING only when
`typeof json === 'string' && json.length <= maxExtractionChars`. `typeof`, the `length` of a
primitive string and `>` are language operators; a page cannot replace them. Anything else
returns `null`. The same gate guards the Marketo JS API probe, which also reads the global
through `Object.getOwnPropertyDescriptor` (a data property is what the real library defines;
an accessor is page code and is not run) and indexes `allForms()` with a counted loop.
Globals are tested with `name in window`, never `typeof window[name]`, which would run a
page-defined getter.

Node then parses the string and REBUILDS the structure with trusted code: every string cut,
every list capped, every enum checked against its allowed set, `data-*` maps rebuilt on a
prototype-free object, markers filtered to the known catalog, a per-frame character budget,
and the privacy rule enforced again (a value survives only for a hidden field that is not a
password, whatever the page handed over). A frame that hands back anything unusable is a
frame error. When that frame is the main document the page outcome is `partial` /
`frame_errors`, never `empty`: an unreadable page says nothing about its forms.

VERIFIED by fixtures: a page that turns `String.prototype.slice` into a no-op still yields a
200 character field name; a page whose extraction exceeds the gate yields `partial`; a page
that defines getters on every probed global sees none of them run.

## 10. Noise classification (`lib/noise.js`)

Noise fields stay in `fields` (with `noise` set) and are excluded from findings and from
"hidden field" counts shown to users. Run AFTER name recovery (11.2). First match wins,
tested on `name`, then `id`, then `leakedName`:

| Class | Rule |
|---|---|
| `captcha` | `/g-recaptcha-response|h-captcha-response|cf-turnstile-response|captcha_settings|^recaptcha-token$/i` |
| `csrf` | `/csrf|xsrf|authenticity_token|__RequestVerificationToken|_wpnonce|(^|_)nonce$|^_token$/i` |
| `antispam` | `/^ak_js$|^ak_hp_|spam/i` |
| `honeypot` | a text-like input (`text`, `email`, `url`, `tel`, `textarea`) with `hiddenKind` `css_hidden` or `offscreen`, `hiddenBy` `self` or `wrapper`, AND (name matches `/honeypot|(^|_)hp(_|$)|^pi_extra_field$|^b_[0-9a-f]{10,}_[0-9a-f]{6,}$|^(website|url|fax|confirm_email)$/i` OR (`tabindex="-1"` AND `autocomplete="off"`)) |
| `framework_state` | `/^gform_|^partial_entry_id$|^state_\d+$|^is_submit_\d+$|^_wpcf7|^__VIEWSTATE|^__EVENT|^_utf8$|^hiddenDependentFields$|^form_build_id$|^form_id$|^_wp_http_referer$|^wpforms\[(id|author|post_id|token)\]|^formid$|^formVid$|^munchkinId$|^lpId$|^subId$|^lpurl$|^followupLpId$|^checksum(Fields)?$|^_mktoReferrer$|^mkt_tok$/` |
| `provider_context` | `/^hs_context$|^_mkt_trk$|^oid$|^retURL$|^debug(Email)?$|^elq(FormName|SiteId|SiteID|CampaignId|CustomerGUID|CookieWrite)$|^xnQsjsdp$|^xmIwtLD$|^actionType$/` |

After the table, one structural rule: a hidden field with no `name`, no `id` and no recovered
name is `unnamed`. It cannot carry a value anywhere (a native post skips it, a script has
nothing to address it by). VERIFIED on a live HubSpot form, where the search boxes inside its
dropdown widgets appeared as hidden fields and one of them came and went between loads.

`provider_context` fields are not junk: they identify the account behind the form. They are
listed in `NATIVE_TRACKING` evidence (names only; for `hs_context` list the JSON keys, never
the values) and excluded from coverage and constants.

### 10.1 Utility forms (dropped before reporting)

VERIFIED on real pages: consent dialogs and captcha shells are `<form>` elements too, and
reporting them buries the real forms under junk findings. A form with provider `generic` is
dropped (and counted in `limits.notes`) only on POSITIVE evidence:

- **consent dialog**: the form has NO text entry field at all (no `textarea`, no input of type
  text, email, tel, url, search, number or password) AND either its `id`, `class` or ancestor
  classes match the consent-tool pattern, or EVERY one of its fields does. Pattern:
  `/onetrust|cookiebot|cybot|osano|didomi|truste|(^|[-_ ])cky([-_ ]|$)|cookie[-_ ]?(banner|consent|notice|dialog|settings|preferences|law)|consent[-_ ]?(banner|dialog|manager|modal)/i`;
- **shell**: no visible field AND no non-noise hidden field.

A field called `gdpr` or `marketing_consent` must NEVER discard a form: a lead form with a
consent checkbox is still a lead form (an earlier, looser rule did exactly that and was
caught in review). Forms with a recognized provider are never dropped. Child frames that are
utility widgets are skipped before extraction (section 8, step 11), including tag-gateway
service worker frames (`/_/service_worker/`), which otherwise surface a phantom search form
that exists on one load and not the other.

## 11. Providers and definitions

### 11.1 Fingerprint signals (`lib/providers.js`)

Form-level signal (class, id, action, field names, data attributes, embed-container ancestor,
frame host) gives the FORM its provider with `high` confidence. Page-level signals (script
host, global, request host, embed container, iframe host) only feed `PageResult.providers`
with `medium`; they never label an individual form, so a site search box on a HubSpot page
stays `generic`/`low`. Evidence strings name the signal that fired. `calendly` is page-level
only (script or iframe host `calendly.com`).

| Provider | Form-level signals | Page-level signals | `providerFormId` |
|---|---|---|---|
| hubspot | `form.hs-form`, `form[id^="hsForm_"]`, field `hs_context`, form inside `iframe.hs-form-iframe`, frame URL on `hsforms.com`/`hsforms.net`/`hsappstatic.net` | `.hs-form-frame`, `.hs-form-html`, `[data-portal-id][data-form-id]`, script host `hsforms.net` or `hs-scripts.com`, global `hbspt` | GUID from `hsForm_<guid>`, `data-form-id`, or the nearest embed container |
| marketo | `form.mktoForm`, `form[id^="mktoForm_"]` | global `MktoForms2`, script path `/js/forms2/js/forms2`, request path `/index.php/form/getForm`, host `munchkin.marketo.net` | digits of `mktoForm_<id>` |
| pardot | `form#pardot-form`, any field name matching `/^\d+_\d+pi_\d+_\d+$/`, field `pi_extra_field`, action matching `/\/l\/\d+\/\d{4}-\d{2}-\d{2}\//` | script `pd.js`, host `pi.pardot.com` | null |
| salesforce_w2l | action contains `servlet/servlet.WebToLead` or `servlet.WebToCase`; field `oid` with that action | | null |
| eloqua | action host ends `.t.eloqua.com`, field `elqFormName` or `elqSiteId` | global `_elqQ` | value of `elqFormName` |
| gravity_forms | `form[id^="gform_"]`, ancestor `.gform_wrapper`, field `gform_submit` | | digits of `gform_<n>` |
| cf7 | `form.wpcf7-form`, field `_wpcf7` | | value of `_wpcf7` |
| wpforms / ninja_forms / formidable / elementor | `form.wpforms-form` / ancestor `.nf-form-cont` / `form.frm-show-form` / `form.elementor-form` | | null |
| typeform | frame URL on `form.typeform.com` | `[data-tf-widget]`, `[data-tf-live]`, script host `embed.typeform.com` | id segment after `/to/` |
| jotform | `form.jotform-form`, action host `jotform.com`, frame URL host `jotform.com` | global `JotForm` | numeric id in action or frame URL |
| google_forms | action contains `docs.google.com/forms` and `formResponse` | iframe src `docs.google.com/forms` | null |
| mailchimp | action host `list-manage.com` | | null |
| klaviyo | form class contains `klaviyo-form` | script host `static.klaviyo.com` | null |
| activecampaign | action contains `activehosted.com/proc.php` | | null |
| dynamics | ancestor `[data-form-block-id]` or `[data-form-id][data-form-api-url]` | host `mkt.dynamics.com` | the data attribute |
| zoho | field `xnQsjsdp` or action host `zoho.com`/`zohopublic.com` | | null |
| unbounce / webflow / formstack | ancestor `.lp-pom-form` / `form[data-wf-page-id]` or ancestor `.w-form` / action host `formstack.com` | | null |
| sharpspring | any hidden constant whose URL host ends `marketingautomation.services` | script host ends `marketingautomation.services` | null |

`sharpspring` from a hidden constant is a PAGE-level vendor hit added alongside the form's
own provider (a Gravity Forms form that posts back to SharpSpring stays `gravity_forms`).

Enrichment vendors (page level, from script and request hosts): `ws.zoominfo.com` or
`zi-scripts.com` gives `zoominfo`; `clearbitjs.com` or `clearbitscripts.com` gives
`clearbit`; `6sc.co` gives `6sense`; `demandbase.com` gives `demandbase`.

### 11.2 Provider-specific name recovery

Pardot: among the three `wrapperClasses` levels, find a class list containing both
`form-field` and `pd-hidden`. `leakedName` = the first token not in
`{form-field, pd-hidden, hidden, required, error, no-label}` and not starting with `pd-`.
Recorded proof: `test/recorded/pardot-landing-form.html`.

### 11.3 Definition capture (in the `response` listener)

Read a body (inside try/catch) when EITHER:

- the response content-type contains `json` (any host, any path), or
- the URL path contains `/index.php/form/getForm` (Marketo serves its descriptor as JSONP
  with a javascript content-type).

Skip bodies over 512 KB (check `content-length` first, then the actual length). Read at most
150 bodies per run. KEEP only bodies that classify below (at most 40, 3 MB total); everything
else is dropped at once and never stored. There is deliberately no host or path filter on
the JSON rule: the fixtures are served from localhost and providers move their endpoints.

Classify BY CONTENT:

- **HubSpot-style**: the JSON contains a key `formFieldGroups` or `fieldGroups` anywhere.
  Walk the whole tree; every object with a string `name` and (string `fieldType` or boolean
  `hidden`) is a field: `hidden = obj.hidden === true`, `defaultValue = obj.defaultValue ??
  obj.selectedOptions?.[0] ?? null`, `label = obj.label`. `providerFormId` = first GUID found
  in top-level `guid`, `formId` or `id`, else the first GUID in the URL.
- **Marketo-style**: strip a JSONP wrapper with `/^[^(]*\(([\s\S]*)\)\s*;?\s*$/` when the
  body is not plain JSON. Walk the tree; every object with string `Name` and string
  `Datatype` is a field: `hidden = Datatype === 'hidden'`, `defaultValue =
  InputInitialValue`, `autofill = { channel: InputSourceChannel, selector:
  InputSourceSelector }` when `InputSourceChannel` exists (VERIFY the four channel values
  `constant`, `url`, `cookie`, `referrer` against a real descriptor when an operator supplies a
  Marketo URL; the walker does not depend on them). `providerFormId` = the `form` query
  parameter, else top-level `Id`.
- **Typeform-style**: any `hidden` key holding an array of strings. Each string is a hidden
  field name.
- Anything else: ignore. A parser that throws yields `parseStatus: 'failed'`, never an
  exception out of `inspect`.

Typeform embed attributes on the parent page also yield `source: 'definition'` fields:
names from `data-tf-hidden="a=1,b=2"` and from `data-tf-transitive-search-params="x,y"`.

### 11.4 Correlating definitions with forms

1. Same provider and equal `providerFormId`: attach.
2. Else exactly one form and exactly one definition of that provider on the page: attach.
3. Else push to `unmatchedDefinitions`. Never guess across multiple embeds.

Merging an attached definition: for each definition field, find the DOM field by exact
`name`, then case-insensitively. Found: fill `definitionInfo`. Not found: append a
`FieldResult` with `source: 'definition'`, `hiddenKind: hidden ? 'type_hidden' : null`, null
values, `population: 'unknown'`. Marketo JS API names (step 12 of `runPage`, names only)
that match no DOM field are appended the same way with `source: 'js_api'`.

## 12. Baseline vs probe (`lib/diff.js`)

Form matching between runs, first rule that yields exactly one candidate:
(1) same provider and equal non-null `providerFormId`; (2) same frame origin+path, same
`attrs.id` (non-null); (3) same frame origin+path, same `attrs.action` and same ordinal
among that frame's forms; (4) same frame origin+path and same ordinal. Frame URLs are
compared with the query string removed. No match: `probeMatched: false`, all populations
`unknown`, outcome `partial`/`probe_unmatched`.

Field matching inside matched forms: by `name`, then `id`, then ordinal among unnamed
fields. Hidden fields that exist ONLY on the probe load are appended with `probeOnly: true`
and a null `baselineValue`; their population comes from the probe value alone. Scripts that
create a hidden input only when an attribution parameter is present are common, and without
this a working capture reads as `not_observed`. An unmatched form degrades the page outcome
(`probe_unmatched`) only when it is a form that gets coverage; an unmatched search or login
form does not.

Population, for fields with `hiddenKind != null` (others get `unknown`):

| Condition | `population` |
|---|---|
| probe did not run or form unmatched | `unknown` |
| probe value contains one or more sentinels | `url_param`, `populatedKeys` = every key found (in key order), `populatedFrom` = the first, `populationEvidence: 'load'`. More than one key means the field stores the landing URL. VERIFIED on a real Gravity Forms page |
| baseline equals probe and non-empty | `constant` |
| both empty | `empty` |
| values differ, no sentinel | `dynamic` |

`matchedKey` is independent of population: the first `AttributionKey` whose alias matches
any of `name`, `id`, `leakedName`, `label`, or the definition field name, using the
normalize-and-contains rule in Appendix A. `utm_source` must match `utm_source`,
`utmsource`, `UTM_Source__c` and `q12_utmSource`. Write a unit test table for this.

`frame.paramsForwardedToFrame`: true when the probe run's frame URL contains any sentinel.

Form `kind` (first match): `login` when it has a password input; `search` when
`role=search`, or the action path contains `/search`, or the only visible field is a text
input named `s`, `q`, `query`, `search` or `keys`; `newsletter` when it has an email input
and at most two visible fields; `lead` when it has an email or tel input or a textarea, or
its provider is not `generic` and not a WordPress generic (`wpforms`, `elementor`,
`ninja_forms`, `formidable`), or it has three or more visible fields; else `other`.
Coverage and findings are computed for every kind except `login` and `search`.

## 13. Findings (`lib/findings.js`)

Pure function: `(pageResultWithoutFindings) => Finding[]`. Every `detail` is at most 240
characters (clamp, do not overflow), plain sentences, no em dashes.

### 13.1 Coverage per form

For each `AttributionKey` `k`:

- `captured`: some non-noise field has `k` in `populatedKeys` (from the load, or in M6 from
  the submit payload; the evidence map records which, as `capturedAt: 'load' | 'submit'`).
  When the only capture is a landing-URL field, the UTM finding says so: the values arrive
  inside one URL field, not in fields of their own.
- `present_not_populating`: not captured, and some non-noise field has `matchedKey === k`
  with population `empty` or `constant`.
- `unknown`: not captured, and (`probeMatched` is not true, or the page outcome is `blocked`,
  or a matching field has population `unknown`).
- `not_observed`: otherwise.

### 13.2 Finding rules

| id | Scope | Severity | When |
|---|---|---|---|
| `UTM_COVERAGE` | form | first match: (1) any UTM key `present_not_populating` gives `gap`; (2) any UTM key `unknown` gives `review`; (3) all five `captured` gives `info`; (4) all five `not_observed` and provider `hubspot` gives `info` (native attribution, see note); (5) otherwise `review` | always, evidence = the five states + provider note |
| `CLICK_ID_COVERAGE` | form | first match: (1) any click ID `present_not_populating` gives `gap`; (2) `gclid` `captured` gives `info`; (3) otherwise `review` | always, evidence = the seven states + whether a `_gcl_aw`, `_fbc` or `_uetmsclkid` cookie contained a sentinel |
| `HIDDEN_CONSTANTS` | form | `info` | one or more non-noise hidden fields with population `constant`. Evidence: up to 15 `{ name, value, urlHost }` where `urlHost` is set when the value parses as a URL |
| `SENSITIVE_HIDDEN_VALUE` | form | `review` | a non-noise hidden field whose name matches `/api[_-]?key|secret|passw|private|bearer|score|grade|tier|internal/i` or whose value matches `/^(sk|pk|rk)_(live|test)_|^eyJ[A-Za-z0-9_-]{10,}\./`. Evidence: names only, never the value |
| `HONEYPOT_PRESENT` | form | `info` | any field with noise `honeypot` |
| `NATIVE_TRACKING` | form | `info` | any `provider_context` field, or provider cookies present (`hubspotutk`, `_mkt_trk`, `visitor_id*`) |
| `FORM_IN_CROSS_ORIGIN_IFRAME` | form | `review` when `paramsForwardedToFrame === false` and no UTM key is `captured`; else `info` | `frame.crossOrigin`. Detail explains that scripts on the parent page cannot fill fields inside the frame, so the values must be passed on the frame URL |
| `ENRICHMENT_VENDOR` | page | `info` | `enrichmentVendors` non-empty |
| `CONSENT_GATED` | page | `info` | banner detected. Detail states which consent mode the observation used |
| `PAGE_BLOCKED` | page | `review` | outcome `blocked` |
| `NO_FORMS_FOUND` | page | `info` | outcome `empty` |
| `EMBED_NOT_RENDERED` | page | `review` | an embed container exists but no form of that provider was extracted. Sets outcome `partial`/`embed_not_rendered` |

### 13.3 Provider notes (fixed strings placed in coverage evidence as `providerNote`)

- hubspot: "HubSpot attributes source from its tracking cookie and the page URL it records
  with each submission, so hidden UTM fields are optional. They matter when leads are handed
  to another system that needs the values as fields."
- marketo: "Marketo logs the visit URL in activity history, but lead fields only receive UTM
  or click ID values through hidden fields."
- pardot: "Pardot writes UTM values to prospect fields through hidden form fields, unless
  its Google Analytics connector is enabled. Click IDs always need hidden fields."
- everything else: "This provider has no built-in capture. Values reach the CRM only through
  hidden fields."

### 13.4 Fixed scope note (`scope.note`)

"Observed on first load of the page in a clean desktop Chrome session. Later form steps,
logged-in states, and fields added at submit time are outside this observation."

## 14. HTTP API v1 (the contract every integration uses)

Base path `/api/v1`. JSON in, JSON out, camelCase. The same document is served as OpenAPI 3.1
at `/api/v1/openapi.json`; a unit test asserts that the OpenAPI paths and the shipped routes
are the same set. Never advertise an endpoint that is not shipped.

### 14.1 Principals and access model

| Principal | How | Id |
|---|---|---|
| API key | `Authorization: Bearer <secret>`; constant-time compare on digests | `key:<name>` |
| UI session | `POST /ui/login` with the passcode sets a signed, HttpOnly, SameSite=Strict, host-only cookie (`__Host-fi_session` when Secure) | `ui` |

Shared workspace: every authenticated principal can read and delete every audit. Documented,
deliberate for v1. Cookie-authenticated requests that change state must carry `X-FI-CSRF: 1`
and, when an `Origin` header is present, it must equal the request host. No CORS headers are
ever sent. `__Host-` cookies are expired by re-setting them with identical attributes.

### 14.2 Error envelope

Every non-2xx answer: `{ "error": { "code": string, "message": string, "details"?: object } }`.
Codes: `bad_request`, `unknown_field`, `invalid_url`, `too_many_urls`, `unauthorized`,
`csrf_required`, `not_found`, `audit_active`, `idempotency_conflict`, `quota_exceeded`,
`queue_full`, `rate_limited`, `payload_too_large`, `internal`. 429 answers carry `Retry-After`.

### 14.3 Endpoints

| Method + path | Auth | Success | Errors |
|---|---|---|---|
| `GET /api/v1/health` | none | 200 `{ status, version, uptimeSec, browser: { state: idle|up|down, sandbox }, queue: { activeInspections, queuedAudits } }` | |
| `GET /api/v1/openapi.json` | none | 200 | |
| `POST /api/v1/audits` | yes | 202 `{ audit }`; idempotent replay 200 `{ audit }` + `Idempotent-Replay: true` | 400, 401, 403, 409, 413, 429 |
| `GET /api/v1/audits` | yes | 200 `{ audits, nextCursor }`, newest first | 400, 401 |
| `GET /api/v1/audits/{id}` | yes | 200 `{ audit }` | 401, 404 |
| `GET /api/v1/audits/{id}/pages` | yes | 200 `{ pages, nextCursor }`, ordered by `position` | 400, 401, 404 |
| `DELETE /api/v1/audits/{id}` | yes | 204 | 401, 403, 404, 409 `audit_active` |
| `POST /ui/login` | none | 204 + cookie | 400, 401, 429 |
| `POST /ui/logout` | cookie | 204 | |
| `GET /ui/session` | none | 200 `{ authenticated, uiEnabled, maxUrls }` | |

`POST /api/v1/audits` body. Unknown keys at any level give 400 `unknown_field` (this is how
unshipped features such as `webhookUrl` or `submitCapture` are refused):

```ts
{
  urls: string[];                 // 1..50 for API keys, 1..FI_UI_MAX_URLS for the UI principal
  label?: string;                 // <= 120 chars
  options?: { probe?: boolean; consent?: 'accept' | 'ignore'; waitMs?: number /* 0..10000 */;
              clickSelectors?: string[] /* <= 5, each <= 200 chars */ };
}
```

URLs: http(s) only, no credentials in the URL, at most 2000 characters, trimmed, hash dropped,
exact duplicates removed with order kept. A single URL is simply an audit with one URL; there
is no separate synchronous endpoint.

`Idempotency-Key` (optional, 1 to 128 characters of `[A-Za-z0-9_.:-]`), scoped per principal
id, remembered 24 hours: same key and same normalized body returns the existing audit with
200; same key and a different body gives 409 `idempotency_conflict`. A replay consumes no
quota.

### 14.4 Admission (atomic, before the row is inserted)

In this order, with no `await` between the first check and the insert: URL-count limit for
the PRINCIPAL (so the UI cap holds for cookie-authenticated API calls too), idempotent replay,
queue capacity (429 `queue_full`), global daily page budget (429, `details.scope =
'global'`) read from an `admissions` ledger that is written at admission and is independent of
the audits table, so deleting finished audits never refunds budget, then one atomic reservation of BOTH hourly counters for the whole URL count
(429, `details.scope = 'principal'`). UI principals are limited per client IP; API keys per
key. The client IP comes from `FI_CLIENT_IP_HEADER` only when the socket peer is inside
`FI_TRUSTED_PROXY_CIDRS`; otherwise the peer address is used, so a spoofed header from an
untrusted peer is ignored (unit-tested).

### 14.5 Resources

```ts
interface Audit {
  id: string;                     // 'aud_' + 20 lowercase base32 chars, opaque, unguessable
  label: string | null;
  status: 'queued' | 'running' | 'complete' | 'failed';   // terminal states never change
  urls: string[];
  options: { probe: boolean; consent: 'accept' | 'ignore'; waitMs: number; clickSelectors: string[] };
  totalPages: number; pagesProcessed: number; formsFound: number;
  hiddenFieldsFound: number;      // non-noise, excluding section-hidden step fields
  summary: AuditSummary | null;   // set when terminal
  error: string | null;
  createdBy: string;              // principal id
  createdAt: string; startedAt: string | null; completedAt: string | null; expiresAt: string;
}
interface AuditSummary {
  outcomes: Record<'ok'|'partial'|'empty'|'blocked'|'failed', number>;
  providers: Record<string, number>;
  edgeCdn: Record<string, number>;    // pages per edge CDN name. Asset CDNs are deliberately not counted
  findings: { gap: number; review: number; info: number };
  coverage: Record<AttributionKey, Record<CoverageState, number>>;   // counted per form
}
interface PageRecord { position: number; url: string; view: 'summary'|'hidden'|'full'; result: object; }
```

`complete` = every URL was processed (single pages may have failed). `failed` = every page
failed, or a restart interrupted the run. One page's exception never ends an audit.

Pagination: `limit` (audits 1..50, default 20; pages 1..50, default 20, but at most 5 when
`view=full`) and an opaque `cursor` taken from `nextCursor` (null when exhausted). Audits are
ordered by `(createdAt, id)` descending; the cursor encodes that pair. List filter: `label`
(exact).

Views of a stored `PageResult`:

- `summary`: url, outcome, providers, `stack`, per form `{ formIndex, provider, providerFormId, kind,
  visible, crossOrigin, counts, coverage }`, findings as `{ id, severity, formIndex, title }`.
- `hidden` (default): summary plus `scope`, `limits`, full findings, and per form the fields
  that matter: non-noise fields that are hidden or come from a definition or script API.
  Section-hidden fields are listed only when they captured a test value or match an
  attribution key; otherwise they are counted in `counts.sectionHidden`. Noise fields are
  listed as `{ name, noise }` only. Query strings are dropped from frame URLs and form actions.
- `full`: the stored `PageResult`.

### 14.6 Queue and lifecycle

Audits run in parallel up to `FI_MAX_ACTIVE_AUDITS`; inside one audit the URLs run strictly one
at a time, with a 2 s pause between two URLs on the same host. Progress counters are written
after every page. On boot, every audit still `queued` or `running` is marked `failed` with
`interrupted by a restart` (crash-only recovery: nothing may sit in a non-terminal state
forever). Hourly housekeeping purges finished audits past `expiresAt` and idempotency keys
older than 24 hours.

### 14.7 Storage seam

Tables `audits`, `audit_pages(audit_id, position, url, outcome, result JSON)`, `idempotency`,
`admissions(created_at, principal, urls)` (kept 48 hours).
Everything above the seam uses only: `createAudit`, `getAudit`, `updateAudit` (column allow
list), `listAudits`, `upsertPage`, `getPages`, `deleteAudit`, `countQueued`,
`recordAdmission`, `urlsAdmittedSince`, `failInterrupted`, `purgeExpired`, `getIdempotency`, `putIdempotency`. A
Postgres adapter implements the same methods.

### 14.8 Response headers

On every response: a strict `Content-Security-Policy` (`default-src 'none'; script-src 'self';
style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action
'self'; frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy`
`same-origin`, `X-Robots-Tag: noindex, nofollow`; `Cache-Control: no-store` on `/api` and `/ui`.

## 15. Web UI and integration patterns

### 15.1 Web UI (optional, enabled by `FI_UI_PASSCODE`)

One static page, no framework, no inline script or style, served at `/`. Hash routes:
`#/` (new audit and recent audits) and `#/audits/<id>` (shareable behind the passcode). It
calls the same `/api/v1` routes with cookie auth. It shows: URL box (up to `maxUrls`), label,
consent mode, probe toggle; live progress with results streaming in as pages finish; per page
the outcome, providers and page-level findings; per form a card with the twelve coverage
chips, the hidden-field table (name, recovered name, how it is hidden, value on the plain
load, value on the test load, reading), a count of section-hidden fields, the ignored
plumbing fields, and the findings by severity; a "how this page was observed" disclosure with
the scope note and limit notes; a raw JSON link. A field that holds several test values is
read as "stores the landing URL". All DOM is built with `textContent`. Avoid nested scroll
containers; let the document scroll and let long values wrap.

### 15.2 Integration patterns (consumers, never part of the core)

Any caller does three things: `POST /api/v1/audits` (with an `Idempotency-Key` when it may
retry), poll `GET /api/v1/audits/{id}` until `complete` or `failed`, read
`GET /api/v1/audits/{id}/pages`. Typical wrappers, each a few lines around those calls:

- a CLI or CI check that fails when any finding has severity `gap`;
- an agent tool adapter (for example an MCP server) exposing `start`, `status` and `pages`
  tools that map one-to-one onto the three calls, defaulting to `view=hidden` because
  `view=full` can be large;
- a CRM or dashboard job that stores the audit id next to a client record and renders the
  `hidden` view.

Give each integration its own named API key so usage shows up per consumer in `createdBy`.

## 16. Tests and fixtures

```
node --test test/unit/*.test.js                                   # host, Node 24+, no browser
docker compose run --rm --no-deps -e NODE_ENV=test form-inspector \
  node --test --test-concurrency=1 test/browser/*.test.js         # inside the image
```

Fixture ports are fixed, so browser tests run with `--test-concurrency=1` and share one
browser per test file. The reference suite takes about two minutes.

### 16.1 Fixture server (`test/fixtures/server.js`)

Started by the test process on `127.0.0.1`: origin A `:4101`, origin B `:4102` (a different
port is a different origin), collector `:4103` (counts every request and WebSocket upgrade it
receives), forbidden `:4104` (a second counter that is NEVER in the allow list). Tests load
config with `NODE_ENV=test` and `FORM_INSPECTOR_TEST_ALLOW=127.0.0.1:4101,127.0.0.1:4102,127.0.0.1:4103`.

| Page | Content | Must assert |
|---|---|---|
| P01 plain-hidden | Web-to-Lead clone: action `https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8`, hidden `oid`, `retURL`, `lead_source=Website`, `00N5e00000AbCdE` filled by an inline script from `utm_source` | provider `salesforce_w2l` high; `00N5e00000AbCdE` is `url_param` from `utm_source`; `lead_source` constant; `oid` is `provider_context`; coverage `utm_source` captured, `utm_medium` not_observed; a visible field has a null value |
| P17 pre-tagged URL | P01 requested as `?utm_source=google&x=1` | baseline run URL has no `utm_source` and keeps `x=1`; the field is `url_param` (NOT `constant`); the replacement note is in `limits.notes`; outcome stays `ok` |
| P02 css-hidden | `li.always-hidden{display:none}` around text input `q12_utmMedium`; off-screen text input `website` with `tabindex=-1 autocomplete=off`; a `display:none` step container with 5 fields; a styled checkbox whose native input has `opacity:0` | `q12_utmMedium` css_hidden/wrapper with `matchedKey utm_medium`, coverage `present_not_populating`, `UTM_COVERAGE` severity `gap`; `website` is `honeypot`; step fields are `section`; the checkbox has `hiddenKind` null |
| P03 iframe-same-origin | iframe to a form page on A | form found, `crossOrigin` false, `depth` 1 |
| P04 iframe-cross-origin | iframe on A to B serving `recorded/pardot-landing-form.html` | provider `pardot` high; five UTM `leakedName` values recovered; `Spam_Filter` antispam via its leaked name; `pi_extra_field` honeypot; `_utf8` framework_state; `paramsForwardedToFrame` false; `FORM_IN_CROSS_ORIGIN_IFRAME` severity `review` |
| P05 shadow-open / P06 shadow-closed | custom element with a form holding hidden `gclid_field` filled from `gclid`; P06 attaches with `mode:'closed'` | both found, `inShadowDom` true, `gclid` captured |
| P07 marketo-like | local stub `forms2.min.js` defining `MktoForms2`; descriptor via JSONP at `/index.php/form/getForm?...&form=1234&callback=cb`; renders `form#mktoForm_1234.mktoForm` with hidden `utm_campaign__c`; descriptor also lists `Industry`, which is not rendered | provider `marketo`, `providerFormId` `1234`; definition attached, `parseStatus` ok; `definitionInfo.autofill = {channel:'url', selector:'utm_campaign'}`; `Industry` present with a non-DOM source |
| P08 hubspot-like | `div.hs-form-frame[data-form-id=<guid>]`, cross-origin iframe on B that fetches `/hs/definition.json` (contains `formFieldGroups`, `guid`) and renders `form#hsForm_<guid>` with hidden empty `utm_source`, hidden `lifecyclestage=lead`, `hs_context` | provider `hubspot`; definition captured by CONTENT from a non-HubSpot host and attached by GUID; `utm_source` `present_not_populating`, `UTM_COVERAGE` `gap`; `hs_context` `provider_context`; `lifecyclestage` constant |
| P08b two-embeds | two hubspot-like embeds with different GUIDs and no UTM fields | each definition lands on its own form; `unmatchedDefinitions` empty; `UTM_COVERAGE` is `info` with the hubspot note |
| P09 lazy | form injected by IntersectionObserver at 3000 px | found |
| P10 consent | `#onetrust-accept-btn-handler`; the populate script runs only after the click | `accept`: captured, `consentClicked` set. `ignore`: `present_not_populating`, banner detected, `CONSENT_GATED` present |
| P11 cookie-populate / P12 dynamic | field filled from a cookie set from the URL; hidden timestamp and random `csrf_token` | `url_param` from `utm_source`; `ts` dynamic; `csrf_token` noise `csrf` |
| P13 / P14 / P15 / P16 | plain page; 403 titled "Just a moment..."; inputs in `div.signup-form` with no `<form>`; hubspot container whose iframe 404s | `empty`/`no_forms`; `blocked` + `PAGE_BLOCKED`; one `pseudoForm`; `partial`/`embed_not_rendered` |
| R01 gravity recorded | serves `recorded/gravityforms-form.html` | provider `gravity_forms`, id `13`; 24 `type_hidden` = 14 `framework_state` + 1 `antispam` + 9 data; a `HIDDEN_CONSTANTS` `urlHost` ending `marketingautomation.services`; page providers include `sharpspring` |
| G01 click guard | lead form posting to the collector; `clickSelectors: ['form button[type=submit]', '#open-modal']` | the submit selector is rejected with a note; collector count unchanged |
| G02 consent look-alike | no banner; a form whose submit button reads "Agree" | `consentClicked` null, collector count unchanged |
| G03 submit guard | page script calls `submit()` and `requestSubmit()` after load, action is the collector | collector count unchanged; the form is still extracted |
| G04 guard tampering | page sets `window.__fiAllowSubmit = true`, calls `submit()`, borrows a native `submit` from a fresh iframe, dispatches a synthetic submit event | collector count unchanged; the form is still extracted |
| S04 / S05 / S06 | inspect the forbidden origin directly; a 302 to it; `<img>`, `fetch`, `sendBeacon`, `WebSocket` to it | `failed`/`address_not_allowed`; forbidden counter stays 0 in all three; `egressBlocked >= 1` in S06 |
| ST stack provenance | `/st` 302 (with a Vercel header) to `/st2` (Cloudflare headers, WordPress generator, `wp-content` asset) holding a subframe with a Netlify header; a 403 bot wall with Cloudflare headers; a page that rewrites its URL with `history.replaceState`; a page that navigates to a 204 carrying a Vercel header | edge CDN is Cloudflare only (hop and subframe ignored), CMS WordPress, framework PHP, no request id anywhere in the result; the blocked page still reports Cloudflare and a failed load has `stack: null`; the rewritten URL keeps its headers; the 204 never changes them |
| TRUST boundary | a page that makes `String.prototype.slice` a no-op and gives a hidden field a 10,000 character name; a page whose hidden value is 4 MB; a page defining getters that fire a request on every probed global | name is 200 characters; outcome `partial`/`frame_errors` with a small result; collector count unchanged |
| sandbox | first test | `browserManager.status().sandbox === true` |

Unit suites without a browser: address policy (first, middle and last address of every
range, mapped and NAT64 forms, public controls, garbage); egress proxy with real sockets
(plain and CONNECT proxying, refusals, injected lookups for mixed answers and rebinding
between connections, connect-by-IP, `[v6]:port`, seal, stats, close); attribution tables;
noise table with negatives; definition parsers (HubSpot-style, `fieldGroups` variant, Marketo
JSON and JSONP, Typeform-style, garbage, the recorded 403 body) and correlation rules; and the
API suite with a fake inspector: credentials required at boot, test allow list ignored in
production, public vs authenticated routes, security headers, create/run/read in three views,
pagination, `view=full` cap, validation and unknown fields, 64 KB body cap, idempotent replay
and conflict, quota reservation for the whole URL count, global budget, 409 on deleting an
active audit, one failing page never ends an audit, UI login with CSRF, foreign Origin, server
side UI URL cap, tampered cookie, logout, login throttle, spoofed client-IP header, OpenAPI
route parity, restart recovery and retention, and the review regressions: probe-only field
counts as captured, a lead form with consent checkboxes is kept while real consent dialogs are
dropped, the result ceiling holds against huge page-controlled strings, definitions are
bounded, deleting audits never reopens the daily budget. `stack.test.js` WALKS THE WHOLE
CATALOG: every edge, hosting, server, generator, marker, header-flag and script-path rule
fires on its declared sample; every asset-CDN and vendor host suffix matches a subdomain and
rejects a look-alike on a label boundary (`evilcloudfront.net`,
`cloudfront.net.attacker.example`); every header a rule reads is on a capture list. A rule
cannot ship without a case (this caught a redundant nested suffix on day one).
`sanitize.test.js` covers the privacy rule, every bound, enum coercion, prototype-safe maps,
the Marketo probe rebuild and the gate parser.

### 16.2 Recorded fixtures (copy `recorded/*` into `test/recorded/`)

| File | Source, 2026-09-18 | Use |
|---|---|---|
| `pardot-landing-form.html` | `form#pardot-form` from `https://learn.cisecurity.org/contact-us` | P04, Pardot name recovery |
| `gravityforms-form.html` | first `gform` from `https://skyhope.org/request-a-free-medical-flight/`, options and scripts removed | R01 |
| `hubspot-embed-variants.html` | two real embed containers and one hand-written legacy embed | container detection |
| `hubspot-v3-definition-403.json` | the real 403 body from the legacy definition endpoint | `definitions.js` must ignore it quietly |

Grow this corpus whenever a real page exposes a variant the fixtures miss: record the form
element (public markup), add an assertion.

### 16.3 Live smoke (informational, never gates the build)

Passive loads of public pages through the real API. Observed with the reference
implementation on 2026-09-18:

| URL | Observed |
|---|---|
| `https://learn.cisecurity.org/contact-us` | pardot; all five UTM values captured through recovered names; no click IDs; consent accepted; one utility form ignored |
| `https://skyhope.org/request-a-free-medical-flight/` | gravity_forms id 13 + sharpspring; `gclid` captured in `input_108`; `input_103` stores the landing URL; 57 section-hidden fields counted, not listed |
| `https://www.fluxx.io/demo` | hubspot in the page DOM; four UTM values captured, `utm_term` not observed |
| `https://www.pkisolutions.com/contact/` | hubspot in a cross-origin iframe; rendered only after real input events |
| `https://pages.pkisolutions.com/schedule-demo` | no form on first load; page providers calendly and hubspot |

Marketo, Eloqua, Typeform and Jotform are covered by synthetic fixtures only. Add live URLs
when an operator supplies them; do not go hunting for third-party pages.

## 17. Milestones and gates

| # | Build | Gate |
|---|---|---|
| M0 | Resolve the Playwright version, pull the image, check its Node version; write `docs/CONTRACT.md` (sections 5, 9 raw shapes, 14, module interfaces) | contract file committed before any handler or module |
| M1 | Pure modules: address policy, egress proxy, attribution, noise, definitions | their unit suites green on the host |
| M2 | Container, sandbox, `browser.js`, `run-page.js` (guards, consent, real input, bounded capture), `extract-inpage.js` | sandbox test green; P01 to P06, P09, P12 to P15, G01 to G03, S04 to S06 green |
| M3 | `providers.js`, `diff.js`, `findings.js`, `inspect.js`, size limits, utility-form filter, `sanitize.js` trust boundary, `stack.js` with its catalog-walking test | every row of 16.1 green |
| M4 | Storage, auth, limits, queue, views, API, OpenAPI | API unit suite green; OpenAPI route parity test green |
| M5 | Web UI, README, deploy notes; live smoke through the real API | UI works end to end against the running container; build report drafted |
| M6 | Optional: dry-run submit capture (section 18) | L01 to L09 green, or M6 removed cleanly |

Commit after each green gate.

## 18. M6: dry-run submit capture (gated, removable)

Start only when M1 to M5 are green and committed. The reference implementation does NOT
include M6: it contains no code path that submits a form. Purpose: see the exact payload a
form WOULD send (including values injected at submit time) while proving nothing leaves the
machine.

Request: `options.submitCapture = { formIndex }` on `POST /api/v1/audits`, accepted only for an
audit with exactly one URL. Allowed only when the page host is an exact entry in env
`FI_SUBMIT_ALLOWLIST` (comma-separated hostnames; empty by default, so the feature is inert
until the operator sets it). Enforce at API admission (400) AND again inside the engine. The target form must have kind `lead`, `newsletter` or `other`. `clickSelectors`
cannot be combined with `submitCapture` (400).

Procedure, in a DEDICATED browser with its OWN egress proxy instance:

1. Load the probe URL exactly as a normal run (click guard and submit guard active, no
   `clickSelectors`) and extract, so `formIndex` resolves.
2. **Seal first**: install a `context.route('**/*')` handler that records and ABORTS every
   request, then call `proxy.seal()` (refuses new connections, destroys open sockets, which
   kills existing WebSockets). From here nothing can leave, on any transport. There are no
   exceptions for captcha hosts. Verify BOTH layers before going on: the proxy
   reports sealed with zero tracked sockets, and a `fetch` from the page to its own origin
   fails. Only then set `window.__fiAllowSubmit = true`
   in every frame (`frame.evaluate`), which lifts the submit guard. NOTE: section 8.1 no
   longer has such a flag (a page could flip it). Build M6 contexts WITHOUT the passive guard
   and its CSP, and rely on the seal; never reintroduce a page-visible switch.
3. Only now fill fields: visible, enabled, `hiddenKind === null`, `noise === null` fields of
   the target form. Values: first name `TEST`, last name `FormInspector`, email
   `forminspector-test@example.com`, phone `555-0100`, company `TEST - DELETE`, any other
   text `TEST`, selects their first non-empty option, required checkboxes checked.
4. Click the form's submit control (`button[type=submit], input[type=submit]`, else the last
   button in the form). Wait 5 s.
5. Collect from `page.on('request')` every request issued after the seal: method, URL
   (origin + path), content type, and the parsed body (urlencoded, multipart field names and
   text values, or JSON). Pick the payload: the first non-GET request to the form's action
   host or a known provider submit host; else the largest non-GET body.
6. Output. For each payload key: when it equals the `name` of an existing field with
   `hiddenKind != null`, set that field's `payloadValue` (300 char cap); `baselineValue` and
   `probeValue` stay as observed. When it matches no existing field, append a `FieldResult`
   with `source: 'payload'` and its `payloadValue`. Payload values of VISIBLE fields are our
   own test data and are not stored. A `payloadValue` that contains a sentinel upgrades the
   field to `population: 'url_param'` with `populatedFrom` set and `populationEvidence:
   'submit'` (load-time detections carry `'load'`). Coverage and findings are recomputed
   after this merge, so a field that is only filled at submit time counts as `captured`.
   Also set the `submitCapture` object `{ status: 'captured' | 'incomplete', endpoint,
   method, keys, note }`. `incomplete` (no payload seen, usually because a captcha
   or a validation call needed the network) is an honest result.

Leak tests against the fixture server (collector on `:4103`, which IS reachable before the
seal, so a zero count proves the seal and not the address policy):

| Test | Form behavior | Assert |
|---|---|---|
| L01 | XHR POST on submit | collector 0, payload captured with hidden fields |
| L02 | `fetch` GET with the data in the query string | collector 0 |
| L03 | `new Image().src` beacon | collector 0 |
| L04 | `navigator.sendBeacon` | collector 0 |
| L05 | WebSocket opened at page load, message sent on submit | collector received 0 messages after the seal; socket closed |
| L06 | native form navigation POST | collector 0, payload captured |
| L07 | `blur` handler POSTs each field value while typing | collector 0 |
| L08 | host not in the allow list | 400, browser never launched |
| L09 | hidden `utm_source` is empty at load and filled by the submit handler from the URL | field keeps empty `probeValue`, gets `payloadValue` with the sentinel, `populationEvidence: 'submit'`; `utm_source` coverage is `captured` with `capturedAt: 'submit'` |

If any of L01 to L07 or L09 cannot be made green, delete `submit-capture.js`, its option and its
tests, keep the 400 for `submitCapture`, and report it. Do not ship a partial seal.

## 19. Operations and deployment

```
cp .env.example .env            # credentials, FI_SESSION_SECRET
docker compose up -d --build
curl -s localhost:3011/api/v1/health      # browser.sandbox must be true
docker compose logs -f
docker compose down
```

- Exposure: the container publishes host loopback only. Put any TLS-terminating reverse proxy
  or tunnel in front (Caddy, nginx, Traefik, Cloudflare Tunnel, Tailscale Funnel) and forward
  the hostname to `http://127.0.0.1:3011`. Set `FI_CLIENT_IP_HEADER` to the single-IP header
  that proxy sets and `FI_TRUSTED_PROXY_CIDRS` to the networks it connects from. Test it: a
  request with a forged header from outside those networks must be limited by its socket
  address.
- Pre-exposure checklist: long random passcode and key secrets; `FI_SESSION_SECRET` set;
  `FI_COOKIE_SECURE=1`; `FI_REQUIRE_SANDBOX=1`; `/health` shows `sandbox: true`; only
  `FI_*` variables exist in the container environment; the published port is loopback.
- Rollback: remove the proxy or tunnel rule, `docker compose down`. Data lives in the named
  volume and can be deleted with it.
- Logs: one JSON line per event (listening, browser ready, inspected host + outcome + ms,
  egress blocked host + reason, purges). Never values, cookies or credentials.
- Sizing: about 2 GB image, 3 GB memory cap, 1 GB `/dev/shm`. Two concurrent page loads fit.

## 20. Later work (not in v1)

| Item | Note |
|---|---|
| Ownership scoping | `createdBy` already exists; scope reads, lists and deletes to the principal before inviting mutually untrusted users |
| Webhooks | needs persisted delivery state, stable event ids, HMAC signatures that can be replayed, bounded timeouts, and target checks through the SAME connection-pinned address policy on every attempt and redirect |
| Postgres adapter, API/worker split | both sit behind the storage seam of 14.7; do them when availability or more than one worker justifies it |
| Multi-step recipes | provider-specific "advance one step without submitting" flows, after passive extraction is trusted |
| Dry-run submit capture | section 18 |
| Mobile viewport, other regions | consent banners and lazy embeds differ by viewport and geography |
| Exports | CSV or sheet export of the `hidden` view |

## 21. Known limits

- First step only. Multi-step and conditional fields appear as section-hidden when they are in
  the DOM, and not at all when they are rendered later.
- One viewport (desktop), one locale, one geography.
- Bot walls are reported, not bypassed. For one's own site the fix is an allow rule there.
- Analytics suppression is best effort; a probe load can still register as a session.
- Closed shadow roots are opened by an init script; a site that captures `attachShadow` before
  any script runs could defeat it (not seen in practice).
- Definition parsers are content-based and miss providers that ship definitions inside
  JavaScript bundles (observed for new-editor HubSpot forms). The DOM layer still reports what
  rendered.
- `egressBlocked` per run is approximate under concurrency (one shared proxy).
- The site stack is what the site REPORTS: headers can be stripped (no signal), forwarded or
  faked. A CDN that adds no distinctive header is invisible. Vendors loaded only after an
  interaction the inspector does not perform are not seen. It is evidence, not an inventory.
- Reading live DOM properties (`input.value`) can run page-defined accessors; that is the
  page's own code and cannot be avoided when the live value is the point.
- UI sessions are stateless signed cookies: logout clears the cookie, it does not revoke a
  stolen one before it expires.
- A hostile page can make the browser work hard inside the time and memory caps; the process
  is crash-only and restarts clean.

## 22. Build report (what the owner reads)

Short blocks, only the non-empty ones, two sentences per item:

- **Applied**: milestones passed, test counts (`x/y` unit, `x/y` browser), commits, what is
  running (health line with `sandbox: true`).
- **Live smoke**: one line per URL (provider, hidden data fields, top finding).
- **Deviations**: every place the build differs from this spec and why (sandbox fallback, a
  dropped hardening flag, a VERIFY claim that turned out wrong).
- **Needs your call**: only choices that move cost, scope or something irreversible, such as
  exposing the service publicly.

---

## 23. Site stack detection (passive, `lib/stack.js`)

Purpose: say what sits behind the page (edge, hosting, server, CMS, vendors) without sending
one extra request. Inputs are all by-products of the BASELINE load: the committed top-level
document's response headers (section 8), the SUBRESOURCE request hosts, the main frame's
`script[src]` URLs, its generator meta tag and a fixed list of DOM markers. No DNS, no WHOIS,
no port or path probing, no second request for headers.

### 23.1 Header capture (`pickHeaders`)

Exact names only, two lists, nothing else is ever kept:

- VALUE headers (value kept, newlines removed, cut at 120): `server`, `via`, `x-powered-by`,
  `x-cache`, `x-served-by`, `cf-cache-status`, `x-amz-cf-pop`, `x-cdn`, `x-generator`,
  `x-litespeed-cache`, `x-kinsta-cache`, `x-pantheon-styx-hostname`, `x-hs-cache-config`,
  `x-shopify-stage`, `x-drupal-cache`, `x-aspnet-version`, `x-nextjs-cache`.
- PRESENCE headers (they carry request ids, so only a flag is kept): `cf-ray`, `x-amz-cf-id`,
  `x-vercel-id`, `x-nf-request-id`, `x-fastly-request-id`, `x-github-request-id`,
  `x-azure-ref`, `x-sucuri-id`, `x-akamai-transformed`, `x-akamai-request-id`,
  `x-wix-request-id`, `fly-request-id`, `wpe-backend`, `x-hs-hub-id`,
  `x-hubspot-correlation-id`, `x-sitecore`, `x-iinfo`, `x-squarespace-did`, `x-wf-region`,
  `x-pardot-rsp`, `x-pardot-route`, `strict-transport-security`.

Cookies, authorization and every other header never enter the result.

### 23.2 Confidence means signature strength

`high` = a distinctive provider signature matched. `medium` = a generic or indirect signal
(markup, a shared host, a `via` token). Neither means verified infrastructure.

### 23.3 Rule catalog (each rule carries a sample; the unit test walks all of them)

| Category | Signal | Examples |
|---|---|---|
| `edgeCdn` | main-document headers | Cloudflare (`cf-ray` or `server: cloudflare`), Amazon CloudFront (`x-amz-cf-id`, or `cloudfront` in `via`/`x-cache`), Fastly (`x-fastly-request-id`, or `x-served-by` naming a cache node), Akamai, Vercel, Netlify, Azure Front Door, Sucuri, Imperva, GitHub Pages, Fly.io, Google Cloud load balancer (`via: 1.1 google`, medium) |
| `hosting` | main-document headers | WP Engine, Kinsta, Pantheon, HubSpot CMS hosting (`x-hs-*`), Shopify, Wix, Squarespace, Webflow, Pardot hosted page (`x-pardot-rsp` / `x-pardot-route`), Amazon S3, Google Cloud frontend (medium) |
| `server`, `frameworks` | `server`, `x-powered-by`, flag headers | nginx, Apache, LiteSpeed, IIS, OpenResty, Caddy, Envoy, Gunicorn, Kestrel; PHP, ASP.NET, Express, Next.js, Nuxt (all medium, except flag headers) |
| `cms` | generator meta (high), DOM markers (medium) | WordPress, Drupal, Joomla, HubSpot CMS, Wix, Squarespace, Webflow, Shopify, Ghost, Sitecore, TYPO3, Craft CMS, Elementor, Adobe Experience Manager |
| `assetCdn` | subresource host suffix, medium | jsDelivr, cdnjs, unpkg, Google Fonts, CloudFront, Akamai, Fastly, Azure CDN, BunnyCDN, KeyCDN, Cloudinary, imgix, HubSpot file CDN, Shopify CDN |
| vendors | subresource or script host suffix | tag managers, analytics, advertising, marketing automation and enrichment, chat, consent, bot protection |
| shared hosts | script PATH | Google Tag Manager needs `/gtm.js`; `/gtag/js` is "Google tag (gtag.js)", not GTM; Meta Pixel needs `fbevents.js` (the Facebook SDK is not the pixel); Reddit Pixel needs `/ads/pixel.js`; reCAPTCHA needs `/recaptcha/` |

Rules for writing rules:

- Host matching is a suffix match ON A LABEL BOUNDARY. `evilcloudfront.net` and
  `cloudfront.net.attacker.example` must not match `cloudfront.net`.
- A host shared by several products is never enough: use the path, or mark it medium.
  `doubleclick.net` and `googlesyndication.com` are "Google advertising network", medium: they
  also serve Google Analytics signals and do not prove a Google Ads account.
  `googleadservices.com` is the distinctive Google Ads conversion host.
- Generic cache headers claim nothing: `x-cache: HIT`, `via: 1.1 varnish`, `cf-cache-status`
  alone and `x-served-by: cache-local` are not a CDN.
- The site's own host is never an asset CDN or a vendor.
- Markup markers are a fixed list emitted by the extractor and filtered again in Node. Weak
  ones were removed on purpose: `data-reactroot` flagged a WordPress site as React because of
  one embedded widget.

VERIFIED live, 2026-09-19:

- Fastly cache node names: `cache-lga-kjfk8660064-LGA`, `cache-ewr-kewr1740052-EWR`,
  `cache-iad-khef600099-IAD` (several, comma separated, when shielding is on). The older
  `cache-ewr18120-EWR` form is accepted too. Pattern:
  `cache-[a-z]{3}(-[a-z]{4})?\d{3,}-[A-Z]{3}`. An origin banner passes through untouched
  (`server: gunicorn` behind Fastly): both are reported, in their own rows.
- A Pardot-hosted landing page sends NO `server` or CDN header at all, only `x-pardot-rsp` and
  `x-pardot-route`. An empty edge row there is correct.
- Sitecore JSS (headless) has no `/-/media/` paths: it serves `/-/jssmedia/` and embeds a
  `script#__JSS_STATE__`. Classic Sitecore uses `/-/media/`.
- Observed stacks: a HubSpot CMS site behind Cloudflare (`x-hs-hub-id` + `cf-ray`); a
  WordPress site on WP Engine behind Cloudflare (`x-powered-by: WP Engine`); a WordPress site
  on plain Apache and PHP with no edge; a Sitecore JSS site behind Cloudflare.

### 23.4 Output rules

Every list holds at most 12 hits, a hit at most 3 evidence strings of 120 characters, so the
block is small by construction. A failed baseline load has `stack: null`. A bot-wall page
keeps its stack: which edge answered is the useful part of a blocked page. Audit summaries
count pages per EDGE CDN name only; asset CDNs are deliberately left out of that count.

## Appendix A. Attribution key aliases

Normalize a candidate string by lowercasing and removing every character that is not a
letter or digit. A key matches when the normalized candidate CONTAINS the normalized key
(`utmsource`, `utmmedium`, `utmcampaign`, `utmterm`, `utmcontent`, `gclid`, `gbraid`,
`wbraid`, `msclkid`, `fbclid`, `lifatid`, `ttclid`). Extra aliases: `googleclickid` for
`gclid`, `facebookclickid` for `fbclid`, `microsoftclickid` for `msclkid`. Test keys longest first so `msclkid`
wins before `gclid` is tried; `gclid` must not match inside `msclkid` (it does not:
`msclkid` does not contain `gclid`), and add an explicit test that `fbclid` does not match
`fbc`.

## Appendix B. Beacon block list (abort, best effort)

`google-analytics.com/collect`, `google-analytics.com/g/collect`,
`analytics.google.com/g/collect`, `*/g/collect?*` on any host (server-side tagging),
`stats.g.doubleclick.net`, `facebook.com/tr`, `bat.bing.com/action`,
`px.ads.linkedin.com`, `analytics.tiktok.com/api`, `track.hubspot.com/__ptq.gif`,
`*/webevents/visitWebPage*` (Munchkin), `pi.pardot.com/analytics`, `*/pi.pardot.com/*analytics*`,
`*.clarity.ms/collect`, `*.hotjar.com/api`, `*.hotjar.io`.
Match on URL substring. Never add a script host (`googletagmanager.com`, `hs-scripts.com`,
`munchkin.marketo.net`, `pd.js`) to this list.

## Appendix C. Consent selectors (first visible wins)

`#onetrust-accept-btn-handler`, `#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll`,
`#CybotCookiebotDialogBodyButtonAccept`, `#hs-eu-confirmation-button`,
`#truste-consent-button`, `.osano-cm-accept-all`, `#didomi-notice-agree-button`,
`.cky-btn-accept`, `#cookie_action_close_header`, `.cc-allow`, `[data-cky-tag="accept-button"]`,
then, as a generic fallback, any visible `button` or `[role=button]` whose trimmed text
matches `/^(accept all|accept all cookies|allow all|allow all cookies|i agree|agree|accept|got it)$/i`
AND that passes the click guard including its consent-container requirement (8.1).


## Appendix D. Integration quick reference

```
POST /api/v1/audits            Authorization: Bearer <key>    Idempotency-Key: <your id>
  {"urls":["https://example.com/contact"],"label":"weekly check"}
-> 202 {"audit":{"id":"aud_...","status":"queued",...}}

GET /api/v1/audits/aud_...     until status is "complete" or "failed"   (poll every 5 to 10 s)
GET /api/v1/audits/aud_.../pages?view=hidden
-> {"pages":[{"position":0,"url":"...","view":"hidden","result":{...}}],"nextCursor":null}
```

Decision rule most callers want: a form needs attention when any finding on it has severity
`gap` (a field exists for a value and is not being filled). `review` means "not observed"
or "unknown" and needs a human look. `info` is descriptive.
