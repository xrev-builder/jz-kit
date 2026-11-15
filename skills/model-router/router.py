#!/usr/bin/env python3
"""model-router: pick a Claude tier (haiku / sonnet / opus) for a task.

Core routing logic is adapted from RouteLLM (Apache-2.0, see NOTICE):
a router scores a prompt with an estimated "strong model win rate" in [0, 1];
if that score >= threshold the prompt goes to the strong model, else the weak one.

Stdlib only. Usage:
  router.py route "<task text>" [--threshold 0.5] [--json]
  router.py route "<task text>" --model router-heuristic-0.5
  router.py calibrate --strong-pct 0.3 --file prompts.txt   # one prompt per line
"""
import abc
import argparse
import json
import re
import sys
from dataclasses import dataclass

# --- adapted from RouteLLM: routers.py -------------------------------------


@dataclass
class RoutedPair:
    strong: str
    weak: str


class Router(abc.ABC):
    # Returns a float in [0, 1]: the (estimated) win rate of the strong model.
    @abc.abstractmethod
    def calculate_strong_win_rate(self, prompt):
        pass

    def route(self, prompt, threshold, routed_pair):
        if self.calculate_strong_win_rate(prompt) >= threshold:
            return routed_pair.strong
        return routed_pair.weak


# --- adapted from RouteLLM: controller.py ----------------------------------


def parse_model_name(model):
    """'router-heuristic-0.5' -> ('heuristic', 0.5)"""
    if not model.startswith("router-"):
        raise ValueError(f"Invalid model {model!r}; expected 'router-[name]-[threshold]'.")
    _, name, threshold = model.split("-", 2)
    return name, float(threshold)


# --- adapted from RouteLLM: calibrate_threshold.py -------------------------


def calibrate(scores, strong_pct):
    """Threshold such that ~strong_pct of scores are >= it (quantile 1 - pct)."""
    if not scores:
        raise ValueError("no scores to calibrate on")
    s = sorted(scores)
    q = 1 - strong_pct
    pos = q * (len(s) - 1)
    lo, hi = int(pos), min(int(pos) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (pos - lo)


# --- new: stdlib heuristic router ------------------------------------------

_HARD = [
    r"\barchitect", r"\bdesign (a|the) (system|schema|protocol)", r"\brefactor\b",
    r"\bsecurity\b", r"\bvulnerab", r"\bconcurren", r"\brace condition", r"\bmigrat",
    r"\bproof\b", r"\boptimi[sz]e\b", r"\btrade-?offs?\b", r"\broot cause",
    r"\bmulti-?(file|step|agent)", r"\bend[- ]to[- ]end\b", r"\bdebug\b",
    r"\bplan\b", r"\bspec\b", r"\badversarial", r"\bpressure[- ]test",
]
_EASY = [
    r"\brename\b", r"\btypo\b", r"\bformat\b", r"\blist\b", r"\bsummari[sz]e\b",
    r"\btranslate\b", r"\bgrep\b", r"\bfind\b", r"\bwhat is\b", r"\bone[- ]liner\b",
    r"\bboilerplate\b", r"\bclassify\b", r"\bextract\b",
]


class HeuristicRouter(Router):
    """Cheap signal mix: length, hard/easy keywords, code and enumeration."""

    def calculate_strong_win_rate(self, prompt):
        p = prompt.lower()
        score = 0.35
        words = len(p.split())
        score += min(words / 400, 0.25)
        score += 0.08 * min(sum(bool(re.search(r, p)) for r in _HARD), 4)
        score -= 0.08 * min(sum(bool(re.search(r, p)) for r in _EASY), 4)
        score += 0.05 * min(p.count("```"), 2)
        score += 0.03 * min(len(re.findall(r"^\s*(\d+\.|-|\*)\s", p, re.M)), 5)
        return max(0.0, min(1.0, score))


ROUTERS = {"heuristic": HeuristicRouter}

# --- Claude tier mapping ----------------------------------------------------

TIERS = RoutedPair(strong="opus", weak="haiku")
MID = "sonnet"


def pick_tier(score, threshold, mid_band=0.2):
    """3 tiers from one score: >= threshold -> opus; within mid_band below -> sonnet; else haiku."""
    if score >= threshold:
        return TIERS.strong
    if score >= threshold - mid_band:
        return MID
    return TIERS.weak


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("route")
    r.add_argument("prompt")
    r.add_argument("--router", default="heuristic", choices=list(ROUTERS))
    r.add_argument("--threshold", type=float, default=0.5)
    r.add_argument("--model", help="RouteLLM-style 'router-NAME-THRESHOLD' (overrides --router/--threshold)")
    r.add_argument("--json", action="store_true")
    c = sub.add_parser("calibrate")
    c.add_argument("--router", default="heuristic", choices=list(ROUTERS))
    c.add_argument("--strong-pct", type=float, required=True)
    c.add_argument("--file", required=True, help="one prompt per line")
    a = ap.parse_args(argv)

    if a.cmd == "route":
        name, thr = (parse_model_name(a.model) if a.model else (a.router, a.threshold))
        if name not in ROUTERS:
            sys.exit(f"unknown router {name!r}")
        score = ROUTERS[name]().calculate_strong_win_rate(a.prompt)
        tier = pick_tier(score, thr)
        if a.json:
            print(json.dumps({"router": name, "threshold": thr, "score": round(score, 3), "tier": tier}))
        else:
            print(f"{tier}  (score {score:.2f}, threshold {thr})")
    else:
        router = ROUTERS[a.router]()
        with open(a.file) as f:
            scores = [router.calculate_strong_win_rate(l.strip()) for l in f if l.strip()]
        t = calibrate(scores, a.strong_pct)
        print(f"For {a.strong_pct * 100:.0f}% strong model calls for {a.router}, threshold = {t:.5f}")


if __name__ == "__main__":
    main()
