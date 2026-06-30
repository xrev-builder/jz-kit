---
name: brand-identity
description: Create or evolve a complete brand identity for mgp — strategic foundation (brand idea, positioning, voice), a rendered brand board, a BRAND.md token spec, and optional wiring into a live codebase verified by screenshot. Premium, monochrome-first, "looks-as-good-as-the-work." Use PROACTIVELY when the user wants to brand or rebrand something — "create a brand", "brand theme", "visual identity", "logo direction", "brand guide", "rebrand", "name + identity for X".
---

# Brand identity

Build brands that read as deliberately designed, not AI-generated — premium,
monochrome-first, one signature accent. This skill is the **process**; the taste layer
lives in [[design-preferences]] (load it too). Reference build: a prior brand, captured in
its own `BRAND.md`.

**Model tier: SMART (`claude-opus-4-8`).** Justified: brand strategy, naming, positioning,
and the brand board are principal-grade, client-facing judgment — the core of the value.
The mechanical parts (token sweep, screenshots) are deterministic shell, not a model call.

## The non-negotiables

1. **The brand must look as considered as the work.** For a studio/firm, the identity *is*
   the proof of competence. Craft is the strategy, not decoration.
2. **Don't invent in a vacuum.** Ground in what the business actually is *before* designing
   (Phase 0). A brand built on a guess is worthless.
3. **Monochrome by default; color is a signal, not a theme.** Ink + paper + **one** ownable
   accent. The accent appears on the mark, one CTA per view, and key data — never smeared
   across the chrome. This is what keeps it enterprise-credible.
4. **Decide, then show.** Make the call as a senior would, render it, and let the user react
   to something concrete. Never present a survey of options as a substitute for a POV.
5. **Proof by screenshot.** Nothing ships without rendering it and *looking*. A clean compile
   is not proof it looks right (Standard §5).
6. **Anti-slop voice.** Plain, declarative, proof over adjectives. Ban: leverage, seamless,
   unlock, empower, revolutionary, cutting-edge, synergy.

## The process

### Phase 0 — Ground (never skip)
Find out what the thing actually is. In order: `memory-search` the brain, grep your Obsidian
vault, read the repo/README. Establish: what it
does, who it's for, the founder's intent. If still unknown, ask — don't guess.

### Phase 1 — Strategy (a POV, not a menu)
Deliver, tight and opinionated:
- **Brand idea** — the one concept everything hangs from (xRev: "the exponent on your business").
  Mine the name first; it usually carries the idea.
- **Positioning** — one paragraph: for [who], [brand] is the [category] that [wedge].
- **Personality** — ~5 traits. **Voice** — tone + a banned-words list.
- **Taglines** — primary + 2 supporting.
Find the category's cliché and define against it (the wedge).

**Positioning-quality gate** — the strategy isn't done until it passes all four:
- **Falsifiable wedge** — makes a claim a competitor would *disagree* with. "High-quality and customer-focused" fails (no one disagrees).
- **Excludes** — it rules someone out. If it fits every company in the category, it isn't positioning.
- **Traceable** — brand idea, tagline, and visual direction all derive from the *same* wedge, not three unrelated ideas.
- **Ownable** — tied to something true about *this* business, not a generic virtue.

### Phase 2 — Decide & show
Recommend ONE visual direction (accent, type, logo), then **render a brand board** with
`show_widget` (recipe: `references/brand-board.md`). Then surface only the *decision-changing*
forks with `AskUserQuestion` — typically: primary buyer (sets polish level), accent boldness,
logo expression. Show options visually; justify your recommendation in prose.

### Phase 3 — Lock the system
- **Color:** ink, paper, accent — with the **two-context split** (accent-on-dark vs a deeper
  accent-on-light that passes AA on white). Neutral chrome ramp. A **separate** data-viz palette.
  **One accent is the default and almost always right.** A second is legitimate only when the
  business has two genuinely distinct modes/products, or a required functional pair beyond the
  semantic states — and it must be as ownable as the first, never smeared on chrome. A second
  accent "to look richer" is the AI tell; resist it.
- **Type:** an intentional family (default Geist + Geist Mono), a discrete scale
  (10·11·12·13·14·16·18·21·25·32), weights 400/500/600, tabular figures on all numbers,
  uppercase micro-labels at .08em. **Choosing/deviating from the family:** Geist is the default;
  deviate when the brand idea calls for character. Method — pick a *display* face that carries
  the wedge, pair it with a neutral *grotesque/body* for legibility, pairing by **contrast**
  (distinct silhouettes) never two similar sans; mono only for code/data. Justify any deviation
  in one line.
- **Logo:** primary lockup + clear-space + min-size + misuse list. A monogram for favicon/avatar.
- **Voice:** do/don't table.

### Phase 4 — Write BRAND.md
Write the source of truth into the project repo (not a chat dump). Skeleton:
`references/brand-md-template.md`. Include a quick-paste CSS variable block.

### Phase 5 — Wire it in + verify (when there's a codebase)
Convert the repo to the brand, then screenshot. Playbook: `references/codebase-wiring.md`.
The load-bearing lessons: map brand colors onto the existing token system (shadcn HSL vars);
**sweep hardcoded palette utilities** (`find … -exec sed` — zsh does NOT word-split `$files`
in a `for` loop, so loops silently no-op); Geist loads via `next/font/google` (`Geist`,
`Geist_Mono`) with no extra dep; then `next dev` + headless-Chrome `--screenshot` and **look**.

## Logo-mark hard lessons (principles — xRev is the case that taught them)
These generalize to any letterform or mark; the xRev examples are illustrations, not the rule.
- **Accent at the core, never the tip.** A colored stroke-*tip* reads as a lit cigarette/match.
  Put the accent at the mark's *crossing/junction node*, not the end of a stroke, and only at
  ≥24px. The favicon/monogram should be **mono** — a one-color silhouette is more premium and
  bulletproof than a fragile two-element mark. (xRev: the accent moved off the `x`'s stroke-end
  onto its crossing core.)
- **Distinctiveness by treatment, not amputation.** Don't delete a letter's strokes to
  "de-genericize" it — you'll turn it into a different glyph (an `x` → `†`/dagger). Keep every
  stroke; get distinctiveness from *weight contrast + italic shear + a woven overpass + chiseled
  terminals*. (xRev learned this turning an `x` into an accidental dagger.)
- **Design the favicon at its native pixel size and judge it on a real tab strip**, not by
  shrinking the master. Verify at 16px on light AND dark chrome.
- For a mark-redesign, run the swarm to pick the *direction*, but the **pixel judgment is yours**
  — agents can't see; iterate your own render→look→critique loop (expect 3-4 rounds).
- **When a symbol keeps getting taste-rejected, stop forcing one.** Wordmark-first (the name
  *is* the logo) is the most credible answer for a firm, and it's what the serious AI players do.
  A derived **character/mascot** (warm, ownable, built from the brand's logic) then carries the
  personality, and **the character's face becomes the favicon** — symbol and mascot are one
  system (the Anthropic/Google pattern: wordmark + critters + mark).
- **Pixel/"bit" characters:** generate programmatically (grid string → `<rect>`s via a tiny
  Python script), not by hand-placing coords; use `shape-rendering="crispEdges"`. One body +
  swappable eyes/limbs = a pose kit. Render and *look* — limbs/expressions read or they don't.
- **Every feature must trace to a brand pillar, or cut it.** When the user asks "what does this
  have to do with the brand?", that's the tell you free-associated off the name's *syllables*
  (rev→revolution→orbit) instead of reasoning from the *idea*. Reason from the idea.

## Verification — evidence required
- Brand board rendered and reviewed.
- BRAND.md written to the repo.
- If code was touched: zero stray old-palette refs (grep proves it), dev server serves 200,
  and screenshots of the changed pages were actually viewed. Report honestly if a page broke.

## Memory
After the build, record a verdict to file-memory (what worked / what to reuse), and a brain
`memory-add` of the locked direction (idea, palette, type, logo, BRAND.md path) so future
sessions don't re-litigate it. Link [[design-preferences]].
