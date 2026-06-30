# Component anatomy

Build screens from these recipes — don't improvise components per-screen. Each bakes in its
states, spacing, and a11y. Defaults assume the [[design-preferences]] scales (type, 4/8 spacing,
radius, motion). Components are where "designed vs. AI-generated" is won or lost.

## Button
- **Sizes:** sm 28px / md 34px / lg 40px height; padding 0 12/14/16. Radius from scale (8–10).
- **Variants:** primary (accent fill, AA-passing label), secondary (hairline + neutral surface), ghost (text only, hover surface).
- **States (all required):** default · hover (surface/fill shift, 120ms) · active (1px translate-y or darken) · focus-visible (≥3:1 ring) · disabled (50% opacity, no pointer) · loading (spinner replaces label, width locked so it doesn't reflow).
- One **primary per view**. Icon+label gap 6–8px; icon 14–16px at 1.6–1.8 stroke.

## Input
- **Height** matches button md (34px); padding 0 10–12; radius 8.
- Hairline border default → **accent focus ring ≥3:1** on focus-visible. **Label above** (never placeholder-as-label). Helper/error text below; error in AA-passing red **+ icon** (never color alone).
- **States:** default · focus · filled · error · disabled. Tabular figures for numeric inputs.

## Table
- **Dense by default** (row 36–40px); header uppercase micro-label .08em; tabular figures in numeric columns, right-aligned.
- Hairline row separators (not heavy borders); hover row tint; **sticky header** on scroll.
- **Zero-state** per design-preferences (explanation + next action). Truncate with `min-width:0` + ellipsis; never wrap-break a data cell.

## Card
- Hairline border + low soft shadow — **one elevation level**, don't float every card. Radius 10–12 (outer > inner).
- Padding 16–20; title 14–16/600 + optional micro-label; tight-but-breathable density.
- Interactive cards get hover (shadow +1 tier, 200ms) + focus-visible.

## Toast
- Bottom-right stack; width 320–380; radius 10; low shadow + hairline.
- Enter 320ms ease-out (slide + fade, **transform/opacity only**); auto-dismiss 4–6s, **pause on hover**; manual close (≥44px target).
- **Variants:** neutral / success / error — icon + text, color **never alone**. Honor `prefers-reduced-motion` (fade only).
