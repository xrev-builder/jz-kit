# Profile: general 🟡 (structured stub — drop-in ready)

For everything that isn't running code or visual design: research reports, strategy, written
deliverables, analysis. Verification shifts from "it runs" to "every claim is true and
sourced." Fill the TODOs to activate; the spine does not change.

## When TRIAGE picks this
Task produces prose, analysis, a decision, or a research artifact rather than code or pixels.
Tier: research = FAST/MID (fan-out is the bulk of the work), synthesis = SMART.

## BUILD executor
Produce the deliverable. Default: the `deep-research` skill for research-shaped asks, or a
writer agent (`content-research-writer` / `technical-writer`) for written deliverables, working
against the locked spec's acceptance criteria.
TODO: decide the default executor per sub-type (research vs. strategy vs. writing) or branch on it.

## PRESSURE-TEST lenses (passed to `pressure-test.js`)
```json
[
  { "key": "factual-accuracy", "prompt": "Check every factual claim against a real source. Flag anything unsourced, outdated, or unsupported. Quote the source or mark it unverified." },
  { "key": "logic",            "prompt": "Attack the reasoning: non-sequiturs, unsupported leaps, conflated correlation/causation, conclusions the evidence doesn't carry." },
  { "key": "bias",             "prompt": "Find one-sidedness, motivated framing, cherry-picked evidence, missing counter-arguments or disconfirming cases." },
  { "key": "completeness",     "prompt": "What's missing? An unaddressed acceptance criterion, an unexplored angle, an unanswered sub-question, a stakeholder not considered." }
]
```

## VERIFY gates (each MUST emit an artifact)
| Gate | Proof | Artifact |
|---|---|---|
| Sourced | every claim has a citation | citation list |
| No contradiction | internal-consistency pass | reviewer note |
| Criteria met | each spec criterion addressed | criterion→section map |
| Adversarial survived | pressure test clean | verdict |

## DONE =
Every claim cited, internally consistent, all acceptance criteria addressed, survived the
adversarial pass. Then → EXIT gate ②.

## TODO to fully activate
- [ ] Pick default BUILD executor per sub-type (research / strategy / writing).
- [ ] Decide whether "claim has a citation" is machine-checkable or reviewer-judged.
- [ ] Set `failHighThreshold` (unsourced load-bearing claim = blocking).
