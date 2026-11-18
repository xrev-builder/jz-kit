# HYPE Athletics website

The rebuilt hypeathletics.org. A fast static site (Astro) built around HYPE's revenue priorities:

1. **Sell memberships**: plan picker, 7-day free trial, tour booking, sticky "Join" bar on phones
2. **Fill programs and teams**: every program with ages, days, dates and fees; find-by-age filter; one page per program
3. **Rentals and donations**: on-site quote form with call/text/email to the right coordinator

No page builder, no plugins, no database. Every change is a commit.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

## Where things live

| What | File |
|---|---|
| Programs: dates, ages, fees, registration links | `src/data/programs.ts` |
| Locations, hours, membership prices, rentals, events, people, facility tour spaces, portal links | `src/data/site.ts` |
| Menu | `src/data/nav.ts` |
| Photos | `src/assets/photos/`, `src/assets/team/`, `src/assets/sponsors/` |
| Design tokens (color, type, motion) | `src/styles/global.css` |
| Form handler (Cloudflare Pages Function) | `functions/api/lead.js` |
| Tracking plan | `ANALYTICS.md` |

**Add a program:** one entry in `src/data/programs.ts`. It shows up on the finder, its sport page,
its location page, its own page at `/programs/<slug>/`, the sitemap and `/llms.txt`. Programs whose
`end` date has passed drop off automatically at the next build.

**Add a facility photo:** drop it in `src/assets/photos/` and set `photo` on the space in `spaces`
(`src/data/site.ts`). Spaces without photos show a "Photo coming soon" panel.

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → `xrev-builder/jz-kit`
2. Build settings: root directory `hype-athletics`, build command `npm run build`, output `dist`
3. Environment variables: see `ANALYTICS.md` (analytics IDs, form delivery, Turnstile)
4. Add the custom domain `hypeathletics.org` (DNS is already on Cloudflare)
5. Optional: a daily deploy hook so finished programs drop off and "Starts …" labels stay current

Every branch gets its own preview URL, so changes can be reviewed before they go live.

## Search & AI answers (SEO/GEO)

- Every page: unique title and description, canonical URL, Open Graph image, breadcrumbs
- Structured data: NGO, ExerciseGym/SportsActivityLocation with hours and address, membership Offers,
  SportsEvent for every dated program, FAQPage, BreadcrumbList
- `/llms.txt`: a plain-text fact sheet for AI assistants, generated from the same data
- `robots.txt` welcomes search engines and AI crawlers; `sitemap-index.xml` lists every page
- All old WordPress URLs keep working (same paths, or 301s in `public/_redirects`)

## Needs confirming with staff (Ali)

- **Program details still missing** (shown as "To be announced"): Elite Wrestling ages, Elite Football ages,
  HYPE Elite Basketball Camp ages and description, Drop-in Pickleball days/times/fee, Fearless walk-in fee
  and ages, Skillz session times and what the $360 package covers, varsity and spring league game times,
  current Sports Performance session dates
- **iClub links**: confirm the member login URL and whether Wayne has its own club number (both centers
  currently use club 9554 from the old site), in `portals` / `joinUrl` in `src/data/site.ts`
- **Member app**: if members use a mobile app, add store links in `portals`
- **Wayne Senior Couple price**: old site lists $38 for both bank draft and card
- **Form delivery**: choose an inbox/webhook and set `RESEND_API_KEY` or `LEAD_WEBHOOK_URL`
- **Photos** for: women-only gym, steam/sauna, martial arts studio, child care, and real program photos
  to replace the stock images on some sport pages
- **Testimonials**: real member and parent quotes (with permission) would strengthen the membership page
- **Hours**: the FAQ's Mon–Fri 6 AM–11 PM, Sat–Sun 8 AM–8 PM is used for both centers
