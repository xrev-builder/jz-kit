# Brand board — show_widget recipe

Proven layout from the xRev build. Renders inline as a reactable visual.

## Setup
1. Call `mcp__visualize__read_me` with `modules: ["art","mockup"]` once (don't narrate it).
2. Emit raw HTML (no DOCTYPE/wrapper). Rules that matter here:
   - **Brand colors are hardcoded hex** — they are the actual brand and must NOT invert in dark
     mode (this is the sanctioned exception to "use CSS vars"). Use `var(--surface-1)`,
     `var(--text-primary)` etc. only for the *chrome* around the swatches.
   - Geist may fall back to a web font inside the widget — fine for a concept board; the real
     fonts get verified later on the `/brand` page (Phase 5).
   - Two weights inside widgets (400/500), sentence case, no emoji, `sr-only` summary first.

## Three reusable boards
- **Brand board** — two logo lockups (ink card + paper card), a 4-swatch color row (ink /
  accent / paper / slate) with hex in mono, a Geist type specimen, voice chips.
- **Accent comparison** — three ink cards, same lockup, accent swapped (recommended / mono /
  cold). Put a `2px solid <accent>` border on the recommended card + a "recommended" kicker.
- **Logo exploration** — 2×2 grid of ink tiles: wordmark · monogram (inline SVG ×) · raised
  exponent (superscript x) · power motif (Rev + superscript x). Each with a one-line rationale.

## Lockup snippet
```html
<div style="background:#0B0B0C;border-radius:14px;padding:30px 26px;display:flex;flex-direction:column;gap:16px">
  <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7A7975">primary lockup</div>
  <div style="font-size:46px;font-weight:500;letter-spacing:-0.03em;color:#F7F6F2;line-height:1">
    <span style="color:#E8A23D">x</span>Rev
  </div>
  <div style="font-family:'Geist Mono',ui-monospace,monospace;font-size:12px;color:#9C9A94">AI that compounds.</div>
</div>
```
Swatch: rounded tile, a solid `height:64px` color block, then `name` (13/500) + `hex` (mono 11px muted).
Use `loading_messages` that are playful unless the brand's subject is serious.
