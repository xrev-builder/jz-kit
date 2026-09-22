# Build report

Built 2026-09-22 from `BUILD-SPEC.md`, after the security review in `SECURITY-REVIEW.md`.

## Applied

| Milestone | State | Gate |
|---|---|---|
| M0 contract | done | `docs/CONTRACT.md` committed before any handler or engine module. Playwright resolved to `1.63.0` against the live registry, matching the image tag the spec verified |
| M1 pure modules | done | address policy, egress proxy, attribution, noise, definitions. Unit suites green on the host |
| M2 container and browser | done | `browser.js`, `run-page.js`, `extract-inpage.js`, guards, consent, real input, bounded capture |
| M3 engine | done | providers, diff, findings, inspect, size limits, utility-form filter, `sanitize.js` trust boundary, `stack.js` with its catalog-walking test |
| M4 API | done | storage, auth, limits, queue, views, app, OpenAPI. Route-parity test green |
| M5 UI and docs | done | web UI driven end to end against the running container process, README and deploy notes written |
| M6 submit capture | **not built** | optional and removed by design, see Deviations |

**Tests: 112 unit, 28 browser, all green.**

```
npm test                                       # 112 pass
FI_REQUIRE_SANDBOX=0 FI_CHROMIUM_PATH=... \
  node --test --test-concurrency=1 --test-timeout=1800000 test/browser/*.test.js   # 28 pass
```

Health line from the running process:

```json
{"status":"ok","version":"0.1.0","browser":{"state":"idle","sandbox":null},
 "queue":{"activeInspections":0,"queuedAudits":0}}
```

The web UI was exercised for real: signed in, started a two-URL audit, polled to `complete`,
and rendered 2 page cards, 24 coverage chips, the hidden-field tables and 7 findings, with no
console errors.

## Defects found and fixed during the build

These are the ones the tests caught, not a list of typos:

1. **`findings.js` read `field.value`** where a `FieldResult` carries `baselineValue`. Every
   `HIDDEN_CONSTANTS` entry therefore lost its value and its `urlHost`, which silently broke
   the SharpSpring detection the R01 fixture exists to prove, and `hs_context` never produced
   its key list. Caught by R01 and P08.
2. **Definitions were counted twice.** The same descriptor is served on both the baseline and
   the probe load. The second copy found its form already taken by rule 1, fell through to
   rule 2, and landed in `unmatchedDefinitions`. Caught by P08b. Definitions are now
   deduplicated before correlation.
3. **An egress refusal was reported as a bot wall.** When the proxy refuses a navigation,
   Chromium renders the proxy's own 403, which looked like `403 + zero forms` and so like a
   site blocking us. A refusal by our own control is now a `failed` outcome carrying the
   proxy's reason. This one matters in production: an SSRF-refused URL must never read as
   "the site blocked us".
4. **Submit buttons were counted as visible fields**, which pushed real lead forms into the
   newsletter bucket.
5. **`EMBED_NOT_RENDERED` did not upgrade an otherwise empty page**, so P16 reported `empty`.
6. **The queue could write to a closed storage handle** during shutdown, producing an
   unhandled rejection. Storage writes in the runner are now non-fatal and the queue has a
   `drain()` that `server.js` awaits on SIGTERM.
7. **A redundant nested host suffix** (`pi.pardot.com` inside `pardot.com`) made the
   look-alike assertion unsatisfiable. The spec predicted exactly this class of bug; there is
   now a standing assertion that no host rule nests one of its own suffixes.

## Deviations

| Deviation | Why |
|---|---|
| **The Chromium sandbox could not be exercised on this build host.** The sandboxed launch fails here with "Chromium sandboxing failed", which is the spec's own verified behaviour under Docker's default seccomp profile. `unshare --user` works, so user namespaces are available; the seccomp profile is the blocker and cannot be changed from inside the container. | The gate itself is tested in both directions: where the sandbox works the suite asserts `sandbox === true`, and here it asserts that `FI_REQUIRE_SANDBOX=1` refuses to browse at all. **`sandbox: true` on the real image is still unverified and must be confirmed on first deploy** with `curl localhost:3011/api/v1/health`. |
| **The image was not built or run.** No Docker daemon is reachable from this environment. `Dockerfile`, `docker-compose.yml` and `seccomp_profile.json` are written to the spec's verified recipe, and the seccomp profile was fetched from the Playwright repository (12,997 bytes, mentions `unshare`). | `docker compose up -d --build` is unverified end to end. |
| **Browser tests ran against the pre-installed Chromium 141** via a new `FI_CHROMIUM_PATH` setting, because the host's browser build does not match Playwright 1.63.0. | `FI_CHROMIUM_PATH` is empty by default, so the image uses its own matching browser. It exists so the suite can run outside the image. |
| **The egress proxy gained an `exclusive` mode** where, in `NODE_ENV=test`, the test allow list is the whole allow list. | Security review item S4: two recorded fixtures reference live third-party scripts (`google.com/recaptcha`, `js.hsforms.net`). Without this, browser tests would fetch them from the real internet: non-deterministic, and announcing every test run to Google and HubSpot. The recorded markup was left untouched, because it is evidence. |
| **`HIDDEN_CONSTANTS` excludes section-hidden fields.** | On the recorded Gravity Forms page the later-step radio defaults filled the 15-entry evidence cap and crowded out the SharpSpring postback URL, which is the whole point of the finding. |
| **Test-only timing overrides** (`wheelStepMs`, `consentSettleMs`, `networkIdleTimeoutMs`). | The fixture server answers instantly, so production settle times only added wall clock. The pipeline is unchanged; the same events fire in the same order. Production defaults are untouched. |
| **Marketo JS API probe runs inside the extractor** rather than as a separate `frame.evaluate`. | It then shares the same size gate and the same trusted rebuild, which is strictly safer. It is declared this way in `docs/CONTRACT.md`, frozen before the code. Still names only: a test asserts the fixture's planted visible-field value never appears anywhere in the result. |
| **`data-form-api-url` added to the embed-container selector.** | The provider table names it for Dynamics but the section 9 selector list omitted it. |
| **Fixture P01 gained first and last name inputs, and P03's iframe carries the page query.** | P01 with only an email matched the newsletter rule before the lead rule, which is correct per the spec but made a "Web-to-Lead clone" read oddly. P03's inner form read attribution from its own frame URL, which the original fixture never passed. Neither change weakens an assertion. |
| **Fixture coverage is the spec's matrix minus the ST 204 and redirect-hop sub-cases**, which are exercised through the `/st` redirect and subframe rather than as separate pages. | The provenance assertion (edge CDN is Cloudflare only, hop and subframe ignored, no request id anywhere) holds. |

## Security review items carried into the build

| Item | Delivered |
|---|---|
| S1/S2 M6 contradictions | M6 not built. `options.submitCapture` is a 400 at the API boundary, asserted by a test, and no submitting code path exists |
| S3 `FI_TRUSTED_PROXY_CIDRS` too wide | Loud warning in `.env.example` and a blockquote in the README. A test proves a forged header from an untrusted peer buys no fresh allowance |
| S4 non-hermetic fixtures | Egress `exclusive` mode, asserted by a unit test |
| S5 unfiltered definition capture | Accepted as designed and documented in the README under "Things to know before you deploy this" |
| S6 shared workspace | Stated plainly in the README |
| S7 unrevocable sessions | README names rotating `FI_SESSION_SECRET` as the incident response |
| S8 passive but not invisible | README states the intended use and that a probe load can register in the target's analytics |

## Needs your call

1. **Where this lives.** It is currently `form-inspector/` inside the `jz-kit` repository,
   which is otherwise a Claude Code skills and workflows kit. It is a self-contained service
   and wants its own repository. Say the word and I will split it out.
2. **Confirm the sandbox on first deploy.** `sandbox: true` is the one gate this environment
   could not prove. Run `docker compose up -d --build` and check
   `curl -s localhost:3011/api/v1/health`. If it reports `false`, the host needs
   `kernel.unprivileged_userns_clone=1` (and on Ubuntu the AppArmor setting); do not work
   around it with `FI_REQUIRE_SANDBOX=0`.
3. **Public URLs in the spec.** Four real public pages remain cited as verified observations
   and the recorded fixtures come from two of them. They identify the observed sites, not you.
   Say so if you want them neutralised too; every affected assertion is listed in spec §16.
4. **Exposing the service.** Nothing here is reachable from the internet yet, and the shared
   workspace model means every credential holder sees every audit. That is the decision to
   make before putting a tunnel in front of it.
