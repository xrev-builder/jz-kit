# jz-kit

Portable Claude Code skills + swarm workflows. Clone on any machine, run `install.sh`,
and these load into `~/.claude/` identically.

## What's inside

| Asset | Type | What it does |
|---|---|---|
| `skills/brand-identity` | skill | Full brand identity: strategy, brand board, `BRAND.md` token spec, optional codebase wiring verified by screenshot. |
| `skills/design-perfect-agent` | skill | Critique **or** generate UI against an 8-dimension falsifiable rubric (Refactoring UI / Apple HIG / Material / WCAG). |
| `skills/design-preferences` | skill | The taste layer — premium, monochrome-first, "designed-not-AI-generated" defaults. |
| `skills/perfect-loop` | skill | Self-improving build loop: triage → spec → build → pressure-test → verify → learn. Swappable profiles (software/design/general). |
| `workflows/build-from-spec.js` | workflow | Parallel build swarm — decompose a locked spec, build in worktree-isolated agents, verify each. |
| `workflows/pressure-test.js` | workflow | Adversarial swarm — diverse lenses probe in parallel, independent skeptics confirm high-severity findings. |

`perfect-loop` orchestrates the two workflow scripts and expects them at
`~/.claude/workflows/` — `install.sh` puts them there.

## Install

```bash
git clone https://github.com/mgpartners-admin/jz-kit.git
cd jz-kit
./install.sh          # symlinks into ~/.claude (repo edits go live)
# or:
./install.sh --copy   # copies instead
```

Restart Claude Code (or open a new session) to pick up the skills. Re-run anytime;
existing targets are backed up to `*.bak`.

## Notes / machine-specific bits

- **Symlink mode** keeps the repo as the source of truth: edit here, `git push`, `git pull`
  on the other machine, done. Use `--copy` if you'd rather snapshot.
- `perfect-loop` Phase 0 can call an optional **triplestack brain** CLI (`~/triple-stack-llm`).
  It's optional — the loop runs fine without it; that step just no-ops if the CLI isn't present.
- The skills cite a prior brand (xRev) and an `Aura OS` / `DESIGN.md` reference as worked
  examples. They're illustrative — point them at your own project's `BRAND.md` / `DESIGN.md`.

## Dependencies

- Claude Code with the `Workflow` tool (for the swarm scripts).
- A `git` repo in the working directory for `build-from-spec.js`'s worktree isolation.
