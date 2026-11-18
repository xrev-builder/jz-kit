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

## Shareable preview: https://hypeathletics.xrev.co

A Cloudflare Worker serves the built site (`deploy/worker.js`): pages, CSS and JS are bundled into the Worker at deploy time, and images and fonts live in Workers KV. Only new image files are uploaded, which keeps deploys well under the free plan’s 1,000 KV writes per day. Preview builds show a
"Preview" banner, send `noindex`, and block crawlers in robots.txt so they never compete with
hypeathletics.org in search. Forms show call/email buttons on the preview.

Redeploy after any change:

```bash
PUBLIC_PREVIEW=1 npm run build
python3 deploy/deploy-preview.py
```

## Going live on hypeathletics.org (recommended: Cloudflare Pages)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → `xrev-builder/jz-kit`
2. Build settings: root directory `hype-athletics`, build command `npm run build`, output `dist`
3. Environment variables: see `ANALYTICS.md` (analytics IDs, form delivery, Turnstile)
4. Add the custom domain `hypeathletics.org` (DNS is already on Cloudflare)
5. Optional: a daily deploy hook so finished programs drop off and "Starts …" labels stay current

The production build (no `PUBLIC_PREVIEW`) is indexable and runs the form function in `functions/api/lead.js`.

## Free day pass (`/day-pass/`)

Replaces the old 7-day trial. A visitor enters name, mobile, email, center and visit day; we text one
6-digit code and email another; both must be entered to get a pass (e.g. `HYPE-7K3Q9P`). The pass is
shown on screen, texted and emailed to them, and emailed to the front desk. One free pass per phone
number or email every 180 days; codes expire after 10 minutes and 5 wrong tries.

Logic lives in `server/daypass.js` (used by both the Pages Function and the preview Worker).

To send real codes, set these in Cloudflare (encrypted):

| Variable | Purpose |
|---|---|
| `DAYPASS` | KV namespace binding (stores pending codes and issued passes) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (or `TWILIO_MESSAGING_SERVICE_SID`) | Text-message codes |
| `RESEND_API_KEY`, `LEAD_FROM` | Email codes and pass confirmations |
| `DAYPASS_NOTIFY_TO` | Front-desk inbox for issued passes (default info@hypeathletics.org) |

The preview at hypeathletics.xrev.co runs in demo mode (`DAYPASS_DEMO=true`): codes are shown on screen
instead of being sent, so the flow can be tried without SMS/email accounts. Never set it in production.

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
- **Insurance page (`/insurance/`)**: for each program in `src/data/insurance.ts`, fill `hype.centers`, `hype.covers`
  and `hype.cost` (cards show "details coming soon" until then); confirm the carrier shortcuts in `carriers`;
  confirm activation steps at the front desk; insurance check requests go to `LEAD_TO_INSURANCE` (default info@)
- **Insurance logo badges**: the small badges on `/insurance/` are each brand's own official site icon
  (`src/assets/insurance/<id>.png`, 64×64). Prime Fitness has none yet (shows initials). Replace any file with an
  official partner-kit logo to upgrade it.
- **Day pass texts**: a Twilio account (or similar) and a sending number for verification codes
- **Day pass rules**: confirm what a day pass includes, the 18+ requirement, and the one-per-180-days limit
- **Photos** for: women-only gym, steam/sauna, martial arts studio, child care, and real program photos
  to replace the stock images on some sport pages
- **Testimonials**: real member and parent quotes (with permission) would strengthen the membership page
- **Hours**: the FAQ's Mon–Fri 6 AM–11 PM, Sat–Sun 8 AM–8 PM is used for both centers
