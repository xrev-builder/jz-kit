# Codebase wiring + verification playbook

How to convert a real repo to the brand and prove it. Tuned for Next + Tailwind + shadcn
tokens (the xRev/apex-crm stack), but the shape generalizes.

## 0. Audit first
Find the *current* palette and how deep it goes — semantic tokens flip for free, but hardcoded
utilities don't:
```
grep -rno "violet-[0-9]*\|cyan-[0-9]*\|purple-[0-9]*" app components --include="*.tsx"
```
Count the files. That's your sweep scope. Report it to the user before changing anything.

## 1. Fonts (next/font/google — no extra dep)
Geist + Geist Mono are in next/font/google. Keep the existing `variable: "--font-sans/mono"`
wiring; only swap the import + constructor:
```ts
import { Geist, Geist_Mono } from "next/font/google";
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
```

## 2. Tokens (map onto the existing system)
shadcn tokens are space-separated HSL consumed via `hsl(var(--x))`. Rewrite `:root` (dark =
signature) and add a `.light` block (first-class). Set `--primary`, `--accent`, `--ring` to the
accent; `--background` ink, `--foreground` paper, `--border` the hairline. Also expose raw brand
hex vars (`--ink`, `--paper`, `--accent-500…`) for direct CSS. In `tailwind.config`, add the full
accent scale (50–900) under `theme.extend.colors` so `accent-*` utilities exist, and repoint any
glow `backgroundImage` off the old hue.

## 3. The sweep (zsh gotcha — this is the one that bites)
**zsh does not word-split an unquoted `$files` in a `for` loop**, and zsh `read -d ''` differs
from bash — so shell loops over the file list silently no-op. Use `find -exec`, which handles
paths (incl. `(marketing)` parens) itself:
```
find app components \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i '' -E 's/(glow-)violet/\1ember/g; s/violet-/ember-/g; s/cyan-/ember-/g' {} +
```
Then prove it: `grep -rno "violet-\|cyan-" …` must return nothing. Collapse secondary accents
(e.g. cyan) into the single brand accent — one signal, not two.

## 4. On-brand utility CSS
Repoint `::selection`, `text-gradient`, `bg-glow`, `card-hover` to the accent at LOW opacity.
No neon glow at rest — one subtle radial wash max; reserve glow/ring for `:focus-within`.

## 5. /brand preview page
Add `app/brand/page.tsx` — lockups, swatches (incl. the accent ramp), Geist specimen, voice
chips — so the real fonts render in the real app, not just the widget.

## 6. Verify (mandatory)
```
npm run dev -- -p 3210 &           # background
# poll until http://localhost:3210/brand returns 200
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,2400 --screenshot=OUT/brand.png http://localhost:3210/brand
# screenshot the homepage + any swept page too, then Read the PNGs and LOOK
pkill -f "next dev -p 3210"        # stop it when done
```
Check: Geist actually rendering (geometric grotesk, not a fallback), accent reads premium not
neon, gradients didn't collapse flat, nothing purple survived, no broken layout. Fix, re-shoot.

## 7. Don't commit unless asked
Other threads may have uncommitted edits to the same files. Leave changes on disk; offer a branch.
