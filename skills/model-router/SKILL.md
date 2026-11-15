---
name: model-router
description: Pick the right Claude tier (haiku / sonnet / opus) for a task or swarm subagent before dispatching it, using a RouteLLM-style cost threshold. Use when deciding which model a subagent should run on, when sizing a swarm's cost, or when the user says "route this", "which model for this", or "cheapest model that can do it". Stdlib-only; adapted from RouteLLM (Apache-2.0).
model: haiku
---

# model-router

Scores a task with an estimated **strong-model win rate** (0-1) and compares it to a
**cost threshold**, the same rule RouteLLM uses: score >= threshold -> strong model, else
weak. A middle band below the threshold maps to the mid tier.

| score vs threshold `t` | tier |
|---|---|
| `>= t` | **opus** (SMART) |
| `t-0.2 .. t` | **sonnet** (MID) |
| `< t-0.2` | **haiku** (FAST) |

## Use

```bash
python3 ~/.claude/skills/model-router/router.py route "refactor the auth module and plan the migration" --threshold 0.5
python3 ~/.claude/skills/model-router/router.py route "rename foo to bar" --model router-heuristic-0.5 --json
# Calibrate so ~30% of your real prompts go to opus (prompts.txt: one per line)
python3 ~/.claude/skills/model-router/router.py calibrate --strong-pct 0.3 --file prompts.txt
```

Then pass the result as the `model` of the subagent (`Agent` tool: `sonnet` / `opus` / `haiku`).

## Rules
- Raise the threshold to save cost; lower it for quality. Calibrate on your own prompts.
- The heuristic router is a cheap proxy (length, keywords, code, lists), not a trained model.
  Override it by judgment when you know better, and never route security or irreversible
  work below sonnet.
- To use RouteLLM's trained routers (`mf`, `bert`, ...), add a `Router` subclass in `router.py`
  and register it in `ROUTERS`. They need torch plus an OpenAI key for embeddings, and were
  trained on GPT-4 vs Mixtral data, so treat their scores as approximate for Claude.

Attribution: see `NOTICE` and `LICENSE-RouteLLM`.
