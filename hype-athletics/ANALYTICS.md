# Analytics & tracking

The site measures every step of HYPE's revenue model. Tracking is built in and switched on with
environment variables, so nothing loads until an ID is set and nothing slows the first paint.

## Turn it on (Cloudflare Pages → Settings → Environment variables)

| Variable | What it enables |
|---|---|
| `PUBLIC_GA4_ID` | Google Analytics 4 (e.g. `G-XXXXXXX`). LeagueApps already uses `G-P0KVHGTCFC` for registrations; using the **same** ID here gives one funnel from site visit to paid registration. |
| `PUBLIC_META_PIXEL_ID` | Meta (Facebook/Instagram) Pixel for ad attribution and retargeting. |
| `PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics (free, cookie-free page views and Core Web Vitals). |
| `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET` | Spam protection on the tour and rental forms. |
| `RESEND_API_KEY` and/or `LEAD_WEBHOOK_URL` | Delivers form submissions (see `functions/api/lead.js`). |

Rebuild after changing `PUBLIC_*` variables (they're read at build time).

## Funnels by revenue stream

| Stream | Funnel events | Conversion (mark as key event in GA4) |
|---|---|---|
| **Memberships (P0)** | `join_click` → `plan_select` → `join_start` | `join_start` (hand-off to iClub signup). Also `tour_submit`. |
| **Programs (P1)** | `program_filter` → page view of `/programs/<slug>/` → `program_register_click` | `program_register_click` (hand-off to LeagueApps) |
| **Rentals** | `rental_click` → `form_start` → `lead_submit` | `lead_submit` |
| **Donations** | `donate_click` | `donate_click` (hand-off to EZFacility) |
| **Contact** | `phone_click`, `text_click`, `email_click`, `directions_click` | Count as micro-conversions |

Every event carries useful parameters where they apply: `placement` (which button: `hero`, `header`,
`mobile_bar`, `plan_picker` …), `plan`, `location`, `pay`, `program`, `sport`, `page`.

Other events: `tour_view` / `tour_location` (facility tour engagement), `portal_click` (member logins),
`age_shortcut`, `form_fallback` (form couldn't send and showed call/email instead; should be 0 once
configured), `outbound_click`, `social_click`.

Meta Pixel mapping: `join_start` → InitiateCheckout, `lead_submit` → Lead, `tour_submit` → Schedule,
`program_register_click` → AddToCart, `donate_click` → Donate, phone/email → Contact.

## Attribution

Links to LeagueApps, iClub, EZFacility and Michigan Academy get `utm_source=hypeathletics.org`,
`utm_medium=website` and `utm_campaign=<page>` when clicked, so registrations and joins can be traced
back to the page that sent them. GA4 cross-domain linking is configured for the LeagueApps and iClub
domains.

## Weekly scorecard to watch

1. Membership trial starts (`join_start`) and tours booked (`tour_submit`), by location
2. Program registration clicks by sport, and the share coming from `/programs/` vs. sport pages
3. Rental leads by space
4. Calls from the site (`phone_click`), by page
5. Core Web Vitals (Cloudflare) on mobile
