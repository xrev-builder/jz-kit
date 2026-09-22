# CONTRACT (frozen)

Frozen before any handler or engine module was written, per BUILD-SPEC section 17 / M0.
Sections 5 and 14 of the spec are the authority. Where this file and the spec disagree, the
spec wins and this file is the bug.

Rules that hold everywhere:

- camelCase keys, never re-keyed between layers.
- `schemaVersion` is `1`. Bump it on any breaking change to `PageResult`.
- The engine (`lib/*`) never imports from `src/*`. It knows nothing about HTTP or storage.
- `src/*` never imports Playwright. It talks to the engine through the injected `inspector`.

## 1. Engine entry point

```
inspect(url, options, deps) -> Promise<PageResult>
```

`options`: `{ probe = true, consent = 'accept', waitMs = 2500, clickSelectors = [] }`.
`deps`: `{ browserManager, now }` (injected for tests). Never throws for a page-level
problem: a failure is a `PageResult` with `outcome: 'failed'`. It throws only on programmer
error (bad argument types).

## 2. PageResult

Exactly the TypeScript block in BUILD-SPEC section 5. Every key is always present; optional
keys are `null`, never absent. `forms` is ordered by `formIndex`, which is the baseline
extraction order.

Privacy invariants, enforced in `lib/sanitize.js` and re-asserted by `sanitize.test.js`:

- `baselineValue` / `probeValue` are non-null ONLY for a field with `hiddenKind !== null`.
- A field with `type === 'password'` never carries a value, whatever the page returned.
- `CookieNote` carries `name`, `domain` and `containsSentinel` only. Never a cookie value.
- `SENSITIVE_HIDDEN_VALUE` evidence carries names only.
- `stack.observed.headerFlags` carries header NAMES only, never their values.

## 3. Module interfaces (the five pure modules)

```
// lib/address-policy.js
isPublicAddress(ip: string) -> boolean          // false for anything unparseable

// lib/egress-proxy.js
createEgressProxy({ lookup?, allowPorts?, testAllow?, onBlock?, loopbackOnly? })
  -> { listen(): Promise<number>, close(): Promise<void>, seal(): void,
       stats(): { connections, blocked, sealed }, port: number|null }

// lib/attribution.js
ATTRIBUTION_KEYS: readonly AttributionKey[]      // 12, in contract order
SENTINELS: Record<AttributionKey, string>        // 'fitest-utm-source' etc
buildRunUrls(requestedUrl) -> { baselineUrl, probeUrl, hadAttribution }
findSentinels(value) -> AttributionKey[]         // decoded once, lowercased, substring
matchKey(candidate) -> AttributionKey | null     // normalize + contains, longest key first

// lib/noise.js
classifyNoise(field) -> 'csrf'|'framework_state'|'captcha'|'honeypot'|'antispam'
                        |'provider_context'|'unnamed'|null

// lib/definitions.js
parseDefinitionBody({ url, body, contentType }) -> DefinitionResult | null
definitionsFromEmbedContainers(containers) -> DefinitionResult[]
correlateDefinitions(forms, definitions) -> { attached: Map<formIndex, DefinitionResult>,
                                              unmatched: DefinitionResult[] }
```

## 4. Raw shapes handed out of the page (section 9)

`extract-inpage.js` returns a JSON **string** or `null`. Nothing else. The string parses to:

```
{ frameUrl, title, bodySample, botMarkers: string[], scripts: string[],
  globals: Record<string, boolean>, iframes: [{src,id,className}],
  embedContainers: [{tag, className, data: Record<string,string>}],
  forms: [{ attrs:{id,name,className,action,method}, selector, inShadowDom, visible,
            classList: string[], pseudoForm: boolean,
            fields: [{ tag, type, name, id, label, required, autocomplete, tabindex,
                       ariaHidden, wrapperClasses: string[][], hiddenKind, hiddenBy,
                       value, valueTruncated, checked, notes: string[] }] }],
  marketo: null | [{ id: string, names: string[] }],
  truncated: boolean }
```

Node treats every value here as attacker controlled. `sanitize.js` rebuilds it; nothing
downstream ever reads the parsed page object directly.

## 5. HTTP API v1

Base `/api/v1`. Exactly the endpoint table in BUILD-SPEC 14.3, and `src/openapi.json`
documents exactly that set (asserted by `openapi.test.js`). Error envelope:

```
{ "error": { "code": string, "message": string, "details"?: object } }
```

Codes: `bad_request`, `unknown_field`, `invalid_url`, `too_many_urls`, `unauthorized`,
`csrf_required`, `not_found`, `audit_active`, `idempotency_conflict`, `quota_exceeded`,
`queue_full`, `rate_limited`, `payload_too_large`, `internal`.

`options.submitCapture` is a known-but-unshipped key: it is rejected with 400
`bad_request` (not `unknown_field`), because BUILD-SPEC 5 lists it in `InspectRequest`.
Every other unknown key at any level is 400 `unknown_field`.

`createApp(config, deps)` where `deps = { storage, inspector, queue, now }`. `server.js` is
the only place that reads `process.env`.

## 6. Storage seam

Above the seam only these methods exist:

```
createAudit, getAudit, updateAudit, listAudits, upsertPage, getPages, deleteAudit,
countQueued, recordAdmission, urlsAdmittedSince, failInterrupted, purgeExpired,
getIdempotency, putIdempotency, close
```

`updateAudit` takes a column allow list. A Postgres adapter implements the same methods with
the same semantics.
