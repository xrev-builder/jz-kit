# Form Inspector

A standalone service that loads public web pages read-only and reports, per form:

- every hidden field (true `type=hidden`, CSS-hidden, off-screen), with its name, its value and
  **how the value got there**;
- which form provider renders it (HubSpot, Marketo, Pardot, Salesforce Web-to-Lead, Eloqua,
  Gravity Forms, Contact Form 7, Typeform, Jotform and others, with a generic fallback);
- whether each UTM parameter and ad click ID is actually captured, has a field that is not
  being filled, or was simply not observed;
- the site stack behind the page, read passively from the same load.

Everything a caller needs is an HTTP endpoint. The API is the only interface; the bundled web
UI is just another consumer of it.

**It never submits a form.** There is no code path that does, under any flag.

## Safety and scope, in plain terms

- **Read-only.** Live URLs get passive page loads. Every click the inspector performs passes a
  guard that refuses anything inside a form, and every page also runs an unconditional submit
  guard backed by a `form-action 'none'` CSP.
- **Sealed egress.** Chromium can only reach public internet addresses. A validating proxy
  resolves each hostname itself, refuses the answer if **any** returned address is private,
  and then connects to the address it validated, so a DNS rebinding answer cannot be used.
  Assume this container sits on a network with databases and admin panels; that is what the
  proxy is for.
- **No evasion.** No stealth plugins, no fingerprint spoofing. A page behind a bot wall is
  reported as blocked, not bypassed.
- **Values.** Values are read only from fields the extractor classified as hidden. Password
  values, visible-field values and cookie values are never read, and nothing is ever logged.
- **Intended use.** Audit pages you own or are authorised to audit. Analytics suppression is
  best effort: a probe load can still register as a session in the target's analytics, and the
  README for any integration should say so.

## Quick start

```bash
cp .env.example .env            # set the credentials and FI_SESSION_SECRET
docker compose up -d --build
curl -s localhost:3011/api/v1/health      # browser.sandbox must be true
docker compose logs -f
```

The process refuses to start without at least one credential (`FI_API_KEYS` or
`FI_UI_PASSCODE`).

### What the host needs for the Chromium sandbox

`FI_REQUIRE_SANDBOX=1` is the default and the service refuses to browse without the sandbox.
The compose file already supplies what the container needs (`cap_drop: ALL` plus
`cap_add: SYS_CHROOT`, `no-new-privileges`, the bundled `seccomp_profile.json` and a non-root
user). The **host** must also allow unprivileged user namespaces:

```bash
sysctl -w kernel.unprivileged_userns_clone=1
# On Ubuntu, additionally:
sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

With Docker's *default* seccomp profile the sandboxed launch fails, which is why the profile
in this repo is passed explicitly. If `/api/v1/health` reports `sandbox: false`, fix the host
rather than setting `FI_REQUIRE_SANDBOX=0`. Never run `0` on a deployment the internet can
reach.

## Exposure

The container publishes **host loopback only**. Put a TLS-terminating reverse proxy or tunnel
in front (Caddy, nginx, Traefik, Cloudflare Tunnel, Tailscale Funnel) and forward to
`http://127.0.0.1:3011`.

Set `FI_CLIENT_IP_HEADER` to the single-IP header that proxy sets, and
`FI_TRUSTED_PROXY_CIDRS` to the networks it connects from.

> **Narrow `FI_TRUSTED_PROXY_CIDRS` on a shared network.** The default
> `127.0.0.0/8,::1/128,172.16.0.0/12` trusts the whole Docker bridge range, which is right when
> the reverse proxy runs on the host. If other containers share that bridge, any of them can
> forge the client-IP header and buy itself a fresh rate-limit allowance. A forged header never
> grants access, but it does weaken the abuse controls. Narrow it to the proxy's exact address.

**Pre-exposure checklist**

- [ ] long random passcode and key secrets, `FI_SESSION_SECRET` set
- [ ] `FI_COOKIE_SECURE=1`
- [ ] `FI_REQUIRE_SANDBOX=1` and `/health` reports `sandbox: true`
- [ ] `FI_TRUSTED_PROXY_CIDRS` narrowed to your proxy
- [ ] only `FI_*` variables exist in the container environment
- [ ] the published port is loopback

## Things to know before you deploy this

- **Shared workspace.** In v1 every authenticated principal can read and delete every audit,
  including audits and URLs created by others. This is deliberate and documented. Do not deploy
  this for mutually untrusted users until ownership scoping lands.
- **Sessions cannot be revoked.** UI sessions are stateless signed cookies with a 12 hour
  default lifetime. Signing out clears the cookie; it does not invalidate a stolen one.
  Rotating `FI_SESSION_SECRET` invalidates every session at once and is the incident response.
- **Third-party JSON can appear in results.** Definition capture classifies response bodies by
  content, with no host or path filter, because providers move their endpoints. Every load runs
  in a clean context with no cookies and no credentials, so only publicly readable JSON is
  reachable, and bodies are size-capped, count-capped and rebuilt through the trust boundary.
  It does mean JSON served to an inspected page can end up in a stored result.
- **The site stack is what the site reports.** Headers can be stripped, forwarded or faked. It
  is evidence, not an inventory.

## Using the API

```
POST /api/v1/audits            Authorization: Bearer <key>    Idempotency-Key: <your id>
  {"urls":["https://example.com/contact"],"label":"weekly check"}
-> 202 {"audit":{"id":"aud_...","status":"queued",...}}

GET /api/v1/audits/aud_...     until status is "complete" or "failed"   (poll every 5 to 10 s)
GET /api/v1/audits/aud_.../pages?view=hidden
-> {"pages":[{"position":0,"url":"...","view":"hidden","result":{...}}],"nextCursor":null}
```

The full contract is served as OpenAPI 3.1 at `/api/v1/openapi.json`, and a unit test asserts
that the document and the shipped routes are the same set.

**The decision rule most callers want:** a form needs attention when any finding on it has
severity `gap`, meaning a field exists for a value and is not being filled. `review` means
"not observed" or "unknown" and needs a human look. `info` is descriptive.

Views: `summary` (outcome, providers, stack, per-form coverage), `hidden` (the default: the
fields that matter, with findings and scope), `full` (the stored result, capped at 5 pages per
request).

Give each integration its own named API key so usage shows up per consumer in `createdBy`.

## Web UI

Set `FI_UI_PASSCODE` and open `/`. One static page, no framework, no inline script, a strict
CSP, and every string from an inspected page reaches the DOM through `textContent`.

## Tests

```bash
npm test                                   # 112 unit tests, no browser, runs on the host
npm run test:browser                       # 28 browser tests, run inside the image
```

Inside the image:

```bash
docker compose run --rm --no-deps -e NODE_ENV=test form-inspector \
  node --test --test-concurrency=1 --test-timeout=1800000 test/browser/*.test.js
```

### Running the browser suite outside the image

The browser suite needs a Chromium that matches the pinned Playwright version, and a host that
can sandbox. Where neither holds, point at another build and turn the sandbox gate off **for
the test run only**:

```bash
FI_REQUIRE_SANDBOX=0 FI_CHROMIUM_PATH=/path/to/chrome \
  node --test --test-concurrency=1 --test-timeout=1800000 test/browser/*.test.js
```

`test/browser/sandbox.test.js` asserts the gate in both directions, so it is meaningful either
way: where the sandbox works it asserts `sandbox === true`, and where it does not it asserts
that `FI_REQUIRE_SANDBOX=1` refuses to browse at all.

The suite is hermetic. In `NODE_ENV=test` the egress allow list is the **whole** allow list, so
the recorded fixtures cannot reach the live third-party scripts their markup references.

## Layout

```
server.js                   entry: env -> config -> build -> listen, restart recovery, shutdown
docs/CONTRACT.md            the frozen seams (result shape, HTTP API, module interfaces)
src/config.js               every env var, limits, credential checks
src/storage.js              storage seam on node:sqlite
src/auth.js                 bearer keys, UI session cookie, CSRF, trusted client IP
src/limits.js               admission counters over the admissions ledger
src/queue.js                audit runner and rollup summary
src/views.js                summary | hidden | full projections
src/app.js                  createApp(config, deps): routes and the error envelope
src/openapi.json            OpenAPI 3.1, exactly the shipped endpoints
lib/address-policy.js       isPublicAddress(ip)
lib/egress-proxy.js         the SSRF control
lib/attribution.js          keys, sentinels, run URLs, name matching
lib/noise.js                honeypots, CSRF, framework state, provider context
lib/definitions.js          provider definition parsing and correlation
lib/browser.js              one Chromium, one proxy, the sandbox gate
lib/run-page.js             one load: guards, consent, real input, bounded capture
lib/extract-inpage.js       the function evaluated inside every frame
lib/sanitize.js             TRUST BOUNDARY: rebuilds everything that left the page
lib/providers.js            fingerprints, Pardot name recovery, page providers
lib/diff.js                 baseline vs probe merge, population, form kind
lib/findings.js             coverage and deterministic findings
lib/stack.js                the passive site-stack catalog
lib/inspect.js              inspect(url, options) -> PageResult
public/                     the web UI
test/                       unit, browser, fixtures, recorded pages
```

## Limits worth knowing

- First load only. Later form steps and conditional fields appear as section-hidden when they
  are in the DOM, and not at all when they render later.
- One viewport, one locale, one geography.
- Definition parsers are content-based and miss providers that ship definitions inside
  JavaScript bundles. The DOM layer still reports what rendered.
- Closed shadow roots are opened by an init script; a site that captures `attachShadow` before
  any script runs could defeat it.
- `egressBlocked` per run is approximate under concurrency, since one proxy is shared.

## Not in v1

Ownership scoping, webhooks, a Postgres adapter, an API/worker split, multi-step recipes,
exports, and the optional dry-run submit capture. `options.submitCapture` is rejected with
400 and no submitting code path exists.
