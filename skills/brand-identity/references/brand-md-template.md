# BRAND.md template

Copy into the project repo root. Fill every bracket. Delete this top line.
Status line tells future readers (and other threads) what's locked.

```markdown
# <Name> — Brand Guide

> Source of truth for the <Name> identity. Tokens here are the contract; consume these
> values, don't re-derive them. Status: **v1 locked** — <accent> + <logo> (primary).

## 1. The idea
**Brand idea — "<the one concept>."** <one-line gloss tying it to the name>.

**Positioning**
> For <who>, <Name> is the <category> that <wedge> — so <the payoff>.

**Audience.** <who buys, near-term vs destination>. **Personality.** <~5 traits>.

**Taglines** — `<primary>` · `<supporting>` · `<supporting>`

## 2. Color
Principle: monochrome by default; color is a signal, not a theme.

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#0B0B0C` | Primary text on light · bg on dark |
| `--paper` | `#F7F6F2` | Page bg (light) · text on dark |
| `--accent-500` | `#______` | Core accent — ON DARK (mark, focus) |
| `--accent-700` | `#______` | Accent ON LIGHT — AA text/border on paper |
| `--slate-500` | `#5F5E5A` | Secondary text / chrome |
| `--line` | `#E4E1D8` | Hairline border (light) — 0.5px |

Two-context rule: 500 on ink, 700 on paper. Never 500 as text on white; never 700 as the mark on black.
Data-viz uses its OWN categorical palette, independent of the brand accent.

## 3. Typography
`--font-sans: Geist` · `--font-mono: Geist Mono`.
Scale (px): 10·11·12·13·14·16·18·21·25·32 (hero → 40/48). Weights 400/500/600.
Display tracking −0.02 to −0.03em. Micro-labels uppercase .08em. Tabular figures on every number.

## 4. Logo
- **Primary:** <lockup desc>. Accent on the <element>.
- **Clear space:** <cap-height of X> on all sides. **Min size:** <px digital / mm print>.
- **Monogram:** <mark> for favicon/avatar, min 16px.
- **Never:** recolor outside accent/mono · stretch/skew · effects/glow · busy bg · smear accent on chrome.

## 5. Voice
Plain, declarative, proof over adjectives. Banned: leverage, seamless, unlock, empower, revolutionary.
| Do | Don't |
|---|---|
| "We cut their close time in half." | "We leverage AI to unlock seamless efficiency." |

## 6. Quick-paste CSS variables
（the full :root block — ink/paper/accent ramp/slate/line + font + radius vars）
```
