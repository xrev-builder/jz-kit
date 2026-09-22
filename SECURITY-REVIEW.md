# Security review: Form Inspector build spec + recorded fixtures

Reviewed 2026-09-22, before any implementation work. Scope: `BUILD-SPEC.md` and the four
files in `test/recorded/`. Verdict: safe to build. No malicious content, no credentials, no
personal data. The findings below are hardening items to carry into the build, not blockers.

## 1. Malware / active-content scan

| Check | Fixtures | Result |
|---|---|---|
| Obfuscated or packed script | all 4 | none |
| `javascript:` URLs | all 4 | none |
| Inline event handlers | gravity (20 `onclick`), pardot (5 `onfocus`) | benign Gravity Forms / Pardot page code, no network calls |
| Inline script bodies | pardot (phone reformatter), hubspot (`hbspt.forms.create` with zeroed ids) | benign |
| `<iframe>` / `<object>` / `<embed>` | all 4 | none |
| Data exfiltration primitives (`fetch`, `XHR`, `sendBeacon`, `WebSocket`) | all 4 | none |
| Prompt-injection / agent-directed instructions | spec + fixtures | none found |

The spec contains no instruction that would redirect an implementer's tooling, escalate
access, or reach outside the declared design.

## 2. Credentials and personal data

No API keys, tokens, passwords, session cookies or private endpoints in either file. No
personal names, emails, phone numbers or addresses appear in the recorded markup — the
fixtures are empty form skeletons with the `<option>` and `<script>` bodies stripped.

Third-party **public** identifiers do survive in the recorded markup, which is expected for
recorded fixtures and is not sensitive: a reCAPTCHA v2 site key (public by design, meaningless
without the paired secret), HubSpot portal/form ids, a SharpSpring postback URL and a form
GUID. These are served to every visitor of those public pages. No action needed; noted so
nobody mistakes them for leaked secrets later.

## 3. Identity scrub (completed)

| Where | Was | Now |
|---|---|---|
| `BUILD-SPEC.md` §18 step 3 | submit-capture test email on a personal domain | `forminspector-test@example.com` (RFC 2606 reserved) |
| `test/recorded/hubspot-embed-variants.html` line 2 | "verbatim from public **client** pages" | "verbatim from public pages" |

Nothing else in either file attributes authorship. Verified by a wide grep over name,
initials, personal-domain, "client", "proprietary" and "confidential" patterns.

**Left in place deliberately:** the four public page URLs the spec cites as verified
observations (`learn.cisecurity.org`, `skyhope.org`, `www.fluxx.io`, `www.pkisolutions.com`).
They are load-bearing — the fixtures are recorded from them, §16.2 and §16.3 index them, and
several assertions reference their real form ids. They identify the *observed sites*, not the
author. If the whole set should also go, say so and they can be replaced with neutral labels;
that is a mechanical change and every affected assertion is listed in §16.

## 4. Design review of the spec

The spec is unusually security-conscious. The controls that matter are present and correct:
a connection-pinned validating egress proxy rather than a DNS pre-check (§7, defeats DNS
rebinding), a deny-by-default address policy covering CGNAT/link-local/cloud-metadata (§7),
a mandatory Chromium sandbox gate (§6.3), an explicit trust boundary that rebuilds everything
leaving the page in Node (§9.2), unconditional submit guards with a CSP `form-action 'none'`
layer (§8.1), a click guard that refuses anything inside a form (§8.1), strict response
headers and CSRF on cookie auth (§14.1, §14.8), constant-time key comparison, and a hard rule
against logging values, cookies or credentials (§2 rule 7).

### Findings to fix during the build

**S1 — Spec contradiction: §2 rule 1 vs §18 (medium).** Rule 1 says "Never submit a form on a
live site"; §18 submits to any host in `FI_SUBMIT_ALLOWLIST`, which are live hosts. The seal
means nothing actually leaves the machine, so the *intent* holds, but the rule as written is
false once M6 ships. Resolution: M6 is out of scope for this build (§18 is optional and the
reference implementation omits it). `submitCapture` is rejected with 400 and no submitting
code path exists. If M6 is ever built, rule 1 must be restated as "never let a submission
reach the network".

**S2 — §18 step 2 is internally inconsistent (medium, deferred with S1).** It instructs
setting `window.__fiAllowSubmit = true` and then states that no such flag exists any more
because a hostile page could set it itself. Only the second half is right. Any future M6 must
create its contexts *without* the passive guard and rely solely on the seal. Flagged in the
spec text is enough for now since M6 is not being built.

**S3 — `FI_TRUSTED_PROXY_CIDRS` default is too wide (low).** The default
`127.0.0.0/8,::1/128,172.16.0.0/12` trusts the entire Docker bridge range, so any other
container on a shared bridge can forge `FI_CLIENT_IP_HEADER` and defeat per-IP rate limiting
and login throttling. Not an authentication bypass — a forged header never grants access — but
it weakens the abuse controls. Build action: keep the default for the documented
reverse-proxy-on-host topology, but warn loudly in `.env.example` and the README to narrow it
to the proxy's exact address on a shared network.

**S4 — Fixture suite is not hermetic (low, but fix it).** Two recorded fixtures reference live
third-party scripts — `https://www.google.com/recaptcha/enterprise.js` and
`//js.hsforms.net/forms/embed/v2.js` — plus one remote image. The egress proxy permits public
addresses, so browser tests would fetch these from the real internet: non-deterministic
results, and test loads announcing themselves to Google and HubSpot. Build action: do **not**
edit the recorded markup (it is evidence). Instead, in `NODE_ENV=test` the run-page route
handler aborts every request whose host is not loopback, so fixtures can only ever reach the
fixture server. A test asserts this.

**S5 — Definition capture has no host or path filter (low, accept).** §11.3 reads any JSON
response body from any host. This is deliberate and necessary (providers move endpoints, and
fixtures are served from localhost). The exposure is bounded: every load runs in a clean
context with no cookies and no credentials, so only publicly readable JSON is reachable;
bodies are size-capped, at most 40 are kept, and everything is rebuilt through `sanitize.js`.
Accept as designed; document in the README that third-party JSON from an inspected page can
appear in stored results.

**S6 — Shared workspace (low, accept, document).** §14.1: every authenticated principal can
read and delete every audit, including audit URLs created by others. Deliberate for v1 and
listed under §20. It must be stated plainly in the README so nobody deploys this for mutually
untrusted users.

**S7 — Stateless session cookies cannot be revoked (low, accept).** Already acknowledged in
§21. Mitigated by a 12 h default lifetime. Rotating `FI_SESSION_SECRET` invalidates all
sessions and should be the documented incident response.

**S8 — Operational note, not a code change.** The tool loads third-party pages with fabricated
attribution parameters and best-effort analytics suppression. It is passive and does not evade
bot walls (§2 rules 1 and 8), but a probe load can still register as a session in the target's
analytics. The README must say this and say that the intended use is auditing pages you own or
are authorised to audit.

## 5. What was changed by this review

1. Both scrub edits in §3.
2. The rest of this document is carried into the build as S3, S4, S5, S6, S7 and S8 — each has
   a concrete deliverable (config warning, hermetic-test rule, README statements).
3. M6/§18 is not implemented. `submitCapture` is rejected at the API boundary.
