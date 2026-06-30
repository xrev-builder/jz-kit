# Profile: software ✅ (flagship — wired end to end)

The default profile for building apps, features, services, tools, scripts. Falsifiable by
construction — "tests pass / app boots" is unambiguous, which is why this profile is the one
proven first.

## When TRIAGE picks this
Task is to build or change running code: app, feature, API, CLI, library, migration, fix
beyond trivial. Tier for cheap phases: research = FAST/MID, build/verify sub-agents = MID.

## BUILD executor
```
Workflow({ scriptPath: "~/.claude/workflows/build-from-spec.js",
           args: { specPath: "SPEC.md", repoDir: "<repo>" } })
```
Decomposes the locked spec → builds each task in an isolated git worktree → per-task verify
against that task's criteria. Returns `passed[]` / `failed[]`. Capture the full summary as
`buildSummary` for the pressure test.

## PRESSURE-TEST lenses
Passed to `pressure-test.js` as `args.lenses`:
```json
[
  { "key": "correctness", "prompt": "Does the implementation satisfy EVERY acceptance criterion in SPEC.md? Find logic bugs, off-by-ones, unhandled edge cases, and criteria silently unmet." },
  { "key": "security",    "prompt": "Find security holes: injection, broken authz/authn, secrets committed to code, unsafe input handling, vulnerable deps. Cross-reference OWASP Top 10." },
  { "key": "does-it-run", "prompt": "Actually install, build, and boot it. Run `npx tsc --noEmit`, the test suite, and hit the key route/path. Report anything that does not run as the build summary claims." },
  { "key": "robustness",  "prompt": "Attack failure modes: error handling, race conditions, resource leaks, N+1s, what breaks under bad input, empty state, or load." }
]
```
`failHighThreshold: 1` (any confirmed CRITICAL or HIGH blocks). For security-sensitive work,
add a 5th lens (`dependency-cves`) and consider the `security-review` skill as a parallel gate.

## VERIFY gates (each MUST emit an artifact)
| Gate | Command / proof | Artifact |
|---|---|---|
| Typecheck | `npx tsc --noEmit` (or stack equivalent) | clean output |
| Tests | project test runner | pass summary + counts |
| Boots + key path | start app, hit primary route/flow | 200 / screenshot via `run` or `verify` skill |
| Security | `security-review` skill or scanner | findings = none blocking |
| Lint/format | project linter | clean |

Missing artifact ⇒ gate not satisfied. No exceptions.

## DONE =
Green typecheck + tests, app boots and the key path responds (with evidence), survived the
pressure test with zero blocking findings, security clean. Then → EXIT gate ②.

## Compose-with
`spec` (gate ①) · `build-from-spec.js` · `pressure-test.js` · `run` / `verify` skills ·
`security-review` · GSD (`gsd:execute-phase`, `gsd:secure-phase`) for larger multi-phase builds.
