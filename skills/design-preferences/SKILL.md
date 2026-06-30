---
name: design-preferences
description: Apply mgp's design preferences for any web UI — premium, monochrome-first, "designed-not-AI-generated" craft. Covers a deliberate type scale, considered radii/depth, neutral chrome with an independent data-viz palette, client-customizable theming, and the plain-CSS-over-fragile-Tailwind lesson. Use PROACTIVELY when designing, building, restyling, or reviewing any dashboard, app, landing page, or component for mgp.
---

# mgp's Design Preferences

mgp cares about UI that reads as **deliberately designed, not AI-generated**. The
brief that recurs: premium, monochrome-first, Linear/Vercel/Arc-level polish but
warmer and bespoke. Reference implementation: the **Aura OS** design system — see
your project's `DESIGN.md` for concrete tokens/components to copy.

When you do real design work for mgp, lean on the `/code-review`/screenshot loop and a
"Meng To" craft lens: an independent critique pass that hunts for generic-AI tells.

## The anti-"generic AI" checklist (the thing mgp reacts to)

Avoid every one of these — they're what makes a UI look machine-spat:

- ❌ Decimal font sizes (`13.5px`). Use a **discrete scale**: 10·11·12·13·14·16·18·21·25·32.
- ❌ Blanket `border-radius: 16px` everywhere. Use a **considered radius scale** (6/8/10/12/18/full), nested correctly (inner < outer).
- ❌ Neon glow at rest. Use hairline borders + low, soft shadows; reserve glow/ring for `:focus-within`.
- ❌ Default Inter on white with a purple gradient. Pick an intentional family (mgp likes **Geist** + Geist Mono); reserve gradients for the brand mark.
- ❌ Emoji or unicode glyphs as icons. Use a real set — **Lucide**, consistent 1.6–1.8 stroke, 14–18px.
- ❌ Gradient "people" avatars. Neutral avatars (surface fill + text initials); gradient only for the brand logo.
- ❌ Color smeared across the chrome. **Chrome stays neutral; color carries information** (status, data).
- ❌ Weak hierarchy, no focus states, no truncation. Add real `:focus-visible`, tabular figures for data, and `min-width:0`+ellipsis on truncating flex children.

## Accessibility floor (AA — non-negotiable)
Objective and always-on. A "premium" UI that fails these isn't premium:
- **Contrast:** body text ≥ **4.5:1**; large text (≥18.66px bold / ≥24px) and UI/icon boundaries ≥ **3:1**.
- **Focus:** a visible `:focus-visible` indicator ≥ **3:1** against its background — never `outline:none` without a replacement ring/token.
- **Targets:** interactive hit area ≥ **44×44px** (WCAG min 24px), with spacing.
- **Motion:** honor `prefers-reduced-motion`; nothing flashes > 3×/sec.
- **Semantics:** ordered headings, labeled inputs, real landmarks — not div-soup.

## Type
Discrete scale (above). Tight tracking on display (-0.02 to -0.03em); micro-labels uppercase at **.08em** (never wider). Tabular figures on every number/price/metric. Weights 400/500/600 only.
**Family — source of truth:** default **Geist + Geist Mono** (loads via `next/font/google`, no extra dep). This is the one place the family is defined — don't restate it elsewhere. Deviate only when the brand calls for it: pair by *contrast* (a distinctive display + a neutral grotesque body), never two similar sans, and say why in one line.

## Shape & depth
Deliberate radius scale; hairline + soft low shadow for elevation; one subtle radial accent wash max. 8pt spacing rhythm.

## Motion
Absent or janky motion is a top "AI tell." Keep it deliberate:
- **Durations:** micro-feedback 120ms · standard transition 200ms · larger/enter 320ms. Nothing instant; nothing >400ms without a loader.
- **Easing:** ease-out for entrances (`cubic-bezier(.2,0,0,1)`); symmetric ease for hovers. Never linear for UI.
- **Animate `transform`/`opacity` only** (GPU-cheap); don't animate layout/`width`/`top`.
- **Feedback < 100ms** on input; async > ~400ms shows a skeleton, not a spinner on blank.
- Always honor `prefers-reduced-motion: reduce` — drop to instant / opacity-only.

## Color & theming
- **Monochrome is the default accent.** Build a **client-customizable theming system**: Appearance (Light / Dark / **System**) × Accent (Mono default + a few options like Indigo/Gold/Emerald), driven by CSS vars on `[data-appearance]`/`[data-theme]`, persisted, applied pre-paint (no flash). **One accent is active per theme** — the menu is the user's *choice* of accent, not a palette to combine.
- Dark is the signature look; light must be first-class.
- Derive tints with `color-mix` (`--accent-soft` etc.).

## Data visualization (senior data-viz discipline)
Charts get **their own palette, independent of the UI accent** — color = information, not decoration. Categorical set (slightly desaturated, colorblind-considerate): blue/amber/teal/magenta/slate/violet. Separate ordinal palette for ordered stages. Keep axes faint; let data color lead. Use `recharts` for real charts, plain CSS for bars/sparklines/conic donuts.

## Signature layout patterns mgp likes
- **Agent-first dashboards** (defined): the primary surface is a command/console hero, not a chart grid. Anatomy — a centered command input (the single focal point) + 3–5 suggestion pills (common intents) + a "recent runs" list directly below; supporting KPIs/data arranged *around* it, subordinate. The user's first move is to **act**, not to read.
- **Seamless collapsible sidebar** (inline icon-rail ↔ full, content reflows) — NOT a pop-out overlay. Nested sub-views under a primary item are welcome.
- KPI tiles with tabular values + sparklines. **Intentional zero-states** (defined): never an empty box or a bare "No data." Every empty state has (1) a one-line plain explanation, (2) the single next action as a button, (3) optional faint icon/illustration — designed with the same care as the populated state.
- Cards: hairline + low shadow; tight, breathable density.

## Component anatomy
Build from the recipes in `references/components.md` — button · input · table · card · toast, each with states, spacing, and a11y baked in. Components are where "designed vs. AI-generated" is won or lost; don't improvise them per-screen.

## Process expectations (learned the hard way)
1. **Decide, then show.** mgp wants a senior designer who makes the call and presents something concrete, not a survey of options. Offer visual previews (open HTML mockups in the browser) to choose color/type/layout.
2. **Always verify by screenshot.** Never declare a UI "done" without rendering it (headless Chrome `--screenshot`, then look). A clean `tsc` is not proof it looks right.
3. **Plain CSS for load-bearing layout.** Tailwind's JIT can silently drop core utilities (`flex-1`, `grid-cols-*`, arbitrary values) in dev and collapse layouts. For structure mgp cares about, prefer a plain CSS layer (scoped under a root class) + inline layout styles over fragile utilities. Use `grid-template-columns: minmax(0, …)` so grids never overflow.
4. **Port from the approved mock 1:1** when "exactly like the mockup" is the ask — translate the literal CSS/DOM, don't re-derive it in utilities.

## When asked to capture/extend the design system
Write or update a project `DESIGN.md` (concrete tokens + components, in the
awesome-design-md style so it can be consumed by design tooling) and keep this skill as
the cross-project distillation of mgp's taste.
