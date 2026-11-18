# HYPE Athletics website

The rebuilt hypeathletics.org: a fast static site (Astro) that replaces the WordPress + Elementor
site. No page builder, no plugins, no database. Every change is a commit.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs static files to dist/
npm run preview   # serves dist/
```

## Where content lives

| What | File |
|---|---|
| Programs, registration links, locations, hours, membership prices, rentals, events, trainers, leadership, sponsors | `src/data/site.ts` |
| Menu structure | `src/data/nav.ts` |
| Photos | `src/assets/photos/`, `src/assets/team/`, `src/assets/sponsors/` |
| Page copy | `src/pages/*.astro` |
| Design tokens (colors, type scale, radius, motion) | `src/styles/global.css` |

**Adding a program** is one line in `programs` in `src/data/site.ts`: title, sport, location,
optional ages/days and the LeagueApps link. It appears automatically on the sport page, the
location page and the program finder.

Photos are optimized at build time (AVIF/WebP at several sizes), so drop in full-size originals.

## URLs

Every page keeps its old WordPress URL (`/basketball/`, `/membership/`, `/dearborn-heights/` …)
so existing links and Google rankings carry over. Retired pages redirect:
`public/_redirects` gives real 301s on Cloudflare Pages; Astro also emits meta-refresh fallbacks.

## Deploy (recommended: Cloudflare Pages)

The domain already runs through Cloudflare. Create a Pages project from this repo with:

- Root directory: `hype-athletics`
- Build command: `npm run build`
- Output directory: `dist`

Then point `hypeathletics.org` at the Pages project.

## Confirm with staff before launch

These came from the old site but are stale or inconsistent there:

- **Wayne Senior Couple price**: the old site lists $38 for both EFT and credit card (every other plan is +$3).
- **Homework Club hours**: the site said Mon–Thu 5–7 PM (2024); the Nov 2025 Instagram post says 5–8 PM, ages 6–12. The new site uses the 2025 version.
- **Hours**: Mon–Fri 6 AM–11 PM, Sat–Sun 8 AM–8 PM comes from the old FAQ and is shown for both centers.
- **Wayne & Belle Isle rental inquiry**: the old site used a WordPress form, which can't move to a static site. The new site uses an email link to Jamie Strange. A Google Form (like Dearborn Heights has) would be better.
- **Program details**: most programs have no ages, dates or fees on the old site, only a LeagueApps link. Adding `ages` and `days` in `site.ts` makes the cards far more useful.
- **26th Anniversary Gala (April 8, 2027)**: sponsorship/ticket link to add when ready.
- **Facility closures**: only Thanksgiving and Christmas 2026 remain. Add 2027 dates to `closures2026` (rename as needed).
