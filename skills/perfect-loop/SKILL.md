---
name: perfect-loop
description: Run mgp's self-improving build loop end to end — triage → sharpen the prompt → research → lock a spec → build → adversarial pressure-test → verify with evidence → learn → loop until done. One engine, swappable domain profiles (software / design / general). Use when the user wants something built or solved to a high bar with rigor and minimal hand-holding — "run the loop", "perfect-loop this", "build X properly", "take this all the way", or any non-trivial build/solve ask where quality and verification matter more than speed. Two human gates only (spec-lock, final ship); autonomous in between.
model: opus
---

# perfect-loop — the self-improving build engine

One loop **spine** with three pluggable **profiles**. The spine is the same every time;
the profile swaps what happens at BUILD, PRESSURE-TEST, and VERIFY. Conform to
`~/.claude/AGENT-STANDARD.md` throughout.

**Model tier: SMART (opus).** Justified — this skill *orchestrates* the loop: it makes the
gating/exit judgments, sizes effort, and synthesizes adversarial findings into a go/no-go.
The cheap, parallel work it dispatches (research scouts, build tasks, probe lenses) runs on
FAST/MID inside the Workflows it calls. Don't run those sub-agents on opus — that's waste.

```
SHARED SPINE
  0 TRIAGE ─ 1 SHARPEN ─ 2 RESEARCH ─ 3 SPEC[gate①] ─┐
                                                       │  profile plugs in below
  ┌────────────────────────────────────────────────────┘
  4 BUILD ─ 5 PRESSURE-TEST ─(fail→4, bounded)─ 6 VERIFY ─ 7 LEARN ─ 8 EXIT?[gate②]
```

---

## Phase 0 · TRIAGE (size the work, pick the profile + tier)

Not every task deserves the full machine. First, route:

```
# Optional: if the triplestack brain CLI is installed on this machine
cd ~/triple-stack-llm && .venv/bin/python brain/cli.py route "<the task>"
```

- **Trivial** (one-file fix, obvious change): bail out of the loop. Do it directly or hand to
  `/gsd:fast`. Say so — don't run swarms on a one-liner.
- **Non-trivial**: classify the domain → pick the profile and read its config:
  - software → `profiles/software.md`
  - design / brand / UI → `profiles/design.md`
  - everything else (research, writing, strategy) → `profiles/general.md`
- Adopt the tier the route + profile recommend for the cheap phases. State the chosen
  profile and why in one line before proceeding.

## Phase 1 · SHARPEN (perfect the prompt, then clarify) — `prompt-perfect-agent`

Run the request through `prompt-perfect-agent` to get a tight, unambiguous task statement.
Then, if ≥2 TASK pieces are genuinely missing and the answer changes the build, ask **one
tight batch** of clarifying questions (`AskUserQuestion`, concrete options + a recommended
default). Otherwise state assumptions and move on. Don't interrogate what you can infer.

## Phase 2 · RESEARCH (cheap insurance before committing)

Fan out scouts so the spec is grounded, not guessed. Use the `deep-research` skill for
external questions, or a `general-purpose`/`Explore` agent swarm for codebase/landscape
scans. Keep this on a cheap tier. Output: a short findings brief that feeds the spec —
conclusions, not dumps. Skip only if the task is fully self-contained and already understood.

## Phase 3 · SPEC ── 🚦 GATE ① ── `spec` skill

Invoke the `spec` skill to turn everything so far into a `SPEC.md` with **falsifiable
acceptance criteria**, and get the user's approval. **This is a hard human gate.** Nothing
expensive runs until the spec is approved. Once approved, the spec is locked — it's the
artifact that persists across loop iterations and stops re-litigation.

## Phase 4 · BUILD (profile-specific executor)

Run the profile's build executor against the locked spec. For **software**:

```
Workflow({ scriptPath: "~/.claude/workflows/build-from-spec.js",
           args: { specPath: "SPEC.md", repoDir: "." } })
```

This decomposes the spec, builds each task in an isolated worktree, and verifies each task
against its own criteria. Capture the build summary (files changed + per-task verdicts) — the
pressure test needs it. Design/general profiles name their own executor in their config.

## Phase 5 · PRESSURE-TEST (the crown jewel) — `pressure-test.js`

Holistic adversarial pass with **diverse lenses** from the profile (software defaults:
correctness · security · does-it-run · robustness). Each lens tries to *break* the work;
high-severity findings get independently confirmed by a skeptic before they count.

```
Workflow({ scriptPath: "~/.claude/workflows/pressure-test.js",
           args: { repoDir: ".", specPath: "SPEC.md",
                   buildSummary: "<from phase 4>",
                   lenses: <profile.lenses> } })
```

- **`pass: false`** → feed the `blocking[]` findings back into **Phase 4** as fix instructions
  and rebuild. **Bounded: max 2 rebuild loops.** If still failing after 2, stop and surface the
  blocking findings to the user — do not loop forever or claim success.
- **`pass: true`** → carry `advisory[]` forward and continue to VERIFY.

## Phase 6 · VERIFY (standards become gates, each emits an artifact)

"Secure / perfectly designed / max standards" are not vibes — they are the profile's
**VERIFY gates**, each producing evidence. For software: typecheck clean, tests pass, app
boots and the key route responds (screenshot/output), security scan clean. Run the profile's
gates; collect the evidence. A gate with no artifact is not satisfied. This is the
AGENT-STANDARD §5 requirement made concrete.

## Phase 7 · LEARN (compound, don't just repeat) — memory + git

Write a **build verdict** memory (AGENT-STANDARD §4): what worked, what broke, the pattern to
reuse. Format per the memory contract; add a one-line pointer to `MEMORY.md`.

**Self-modification guard — hard-enforced, not advisory.** Any change the loop makes to its
OWN machinery — anything under `~/.claude/` (skills, agents, profiles, workflows, templates) —
runs this protocol. Never edit live tooling in place.

1. **Branch.** `~/.claude` is a git repo. Before touching tooling:
   `git -C ~/.claude checkout -b loop/self-update-<slug>`
2. **Edit** on that branch only.
3. **Verify.** Validate the change — re-read skills/profiles for coherence; for workflow JS,
   syntax-check the body (wrap as the harness async fn — top-level `return` / `export const meta`
   fail a bare `node --check`); for agents, sanity-check frontmatter + tools. Capture evidence.
4. **Diff.** `git -C ~/.claude --no-pager diff main...HEAD` — present the full diff to the user.
5. 🚦 **Approval gate.** The user must approve before it's permanent.
   - approve → `git -C ~/.claude commit -am "<what + why>"`, merge to main.
   - reject  → `git -C ~/.claude checkout main && git branch -D loop/self-update-<slug>` — gone, no trace.

Tooling is NEVER silently committed to main; the branch + diff + gate **is** the enforcement
(git state, reversible, human-approved — not willpower). The user's project/work output is
exempt — this guard governs only the loop editing *itself*.

## Phase 8 · EXIT ── 🚦 GATE ② ── (converge, cap, or approve)

Stop when **any** holds:
- **Converged** — pressure test passed clean and a fresh round surfaces nothing material new.
- **Budget** — token/iteration cap hit (say what's left undone).
- **Approved** — present the verified result + evidence; the user gives the final ship gate.

Default: stop at the first clean pressure-test + VERIFY, present evidence, and ask for the
ship gate. Don't loop for the sake of looping.

---

## Profiles (one engine, swappable policy)

| Phase | `software` ✅ wired | `design` 🟡 stub | `general` 🟡 stub |
|---|---|---|---|
| BUILD | `build-from-spec.js` (worktree) | `brand-identity` / `design-preferences` | writer / `deep-research` synth |
| PRESSURE lenses | correctness · security · does-it-run · robustness | visual-fidelity · a11y · brand-coherence · UX | factual-accuracy · logic · bias · completeness |
| VERIFY gates | tsc · tests · boots+route · security scan | screenshot matches spec · WCAG · token spec | every claim cited · no contradiction |
| DONE = | green checks + survived pressure test | rendered + verified vs BRAND.md | cited report, survived adversarial pass |

Full configs in `profiles/`. To add a domain later: drop a new `profiles/<name>.md` — the
spine doesn't change.

## Bar
A trivial task should never reach Phase 4. A shipped result must carry its evidence. "Done"
without an artifact is a lie. Cut the throat-clearing; show the verdict.
