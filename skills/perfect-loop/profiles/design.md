# Profile: design 🟡 (structured stub — drop-in ready)

For brand, visual identity, UI, and design-system work. The taste layer lives in
[[design-preferences]] and [[brand-identity]]; this profile wires them into the loop. Fill the
TODOs to activate; the spine does not change.

## When TRIAGE picks this
Task is to create or evolve a brand, visual identity, UI surface, design system, or restyle.
Tier: research = FAST/MID, build/verify = MID (rendering + visual judgment).

## BUILD executor
Invoke the `brand-identity` skill (new/rebrand) or `design-preferences` (restyle/review),
producing a rendered artifact + a `BRAND.md` / token spec wired into the codebase.
TODO: decide whether to wrap this as a Workflow (parallel concept exploration → judge panel →
synthesize winner) the way `build-from-spec.js` wraps software, or call the skill directly.

## PRESSURE-TEST lenses (passed to `pressure-test.js`)
```json
[
  { "key": "visual-fidelity",  "prompt": "Does the rendered output match the spec and BRAND.md tokens exactly — type scale, spacing, radii, color, accent usage? Screenshot and compare." },
  { "key": "accessibility",    "prompt": "WCAG AA: contrast ratios, focus states, target sizes, motion, semantic structure. Report concrete failures." },
  { "key": "brand-coherence",  "prompt": "Is it premium, monochrome-first, deliberately-designed — not AI-generated? One signature accent, restrained chrome. Flag generic/templated tells." },
  { "key": "ux",               "prompt": "Cognitive load, hierarchy, affordances, error/empty states. Would a real user accomplish the job without friction?" }
]
```

## VERIFY gates (each MUST emit an artifact)
| Gate | Proof | Artifact |
|---|---|---|
| Renders | build + screenshot the surface | screenshot |
| Matches spec | diff render vs BRAND.md tokens | comparison |
| WCAG AA | contrast/a11y check | pass report |
| Token spec exists | `BRAND.md` present + wired | file + live screenshot |

## DONE =
Rendered, screenshot-verified against `BRAND.md`, WCAG AA clean, survived the design pressure
test. Then → EXIT gate ②.

## TODO to fully activate
- [ ] Confirm BUILD wrapper (direct skill call vs. judge-panel Workflow).
- [ ] Confirm screenshot tooling path (`run`/`verify`/Preview MCP).
- [ ] Set `failHighThreshold` for design (a11y criticals always block).
