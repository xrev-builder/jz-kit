// Cloudflare Pages Function: POST /api/lead
// Receives tour requests and rental inquiries from the site and delivers them to staff.
//
// Configure in Cloudflare Pages → Settings → Environment variables (encrypt the secrets):
//   RESEND_API_KEY      Resend.com API key (sends the email)            ─┐ set one or both
//   LEAD_WEBHOOK_URL    Any webhook (Zapier, Make, Slack, Google Sheet) ─┘
//   LEAD_FROM           Verified sender, e.g. "HYPE Website <web@hypeathletics.org>"
//   TURNSTILE_SECRET    Optional: Cloudflare Turnstile secret (pair with PUBLIC_TURNSTILE_SITE_KEY at build)
//   LEAD_TO_TOUR, LEAD_TO_RENTAL_DH, LEAD_TO_RENTAL_WAYNE   Optional overrides for recipients
//
// With nothing configured the endpoint answers 503 and the form shows call/email buttons instead.

const ROUTES = {
  tour: (env) => env.LEAD_TO_TOUR || 'info@hypeathletics.org',
  'rental:dearborn-heights': (env) => env.LEAD_TO_RENTAL_DH || 'zsaab@hypeathletics.org',
  'rental:wayne': (env) => env.LEAD_TO_RENTAL_WAYNE || 'jstrange@hypeathletics.org',
  'rental:belle-isle': (env) => env.LEAD_TO_RENTAL_WAYNE || 'jstrange@hypeathletics.org',
};
const FIELDS = ['kind', 'name', 'phone', 'email', 'location', 'when', 'eventType', 'date', 'guests', 'time', 'message', 'page'];
const LABELS = { kind: 'Type', name: 'Name', phone: 'Phone', email: 'Email', location: 'Location', when: 'Best time', eventType: 'Event type', date: 'Date', guests: 'Guests/players', time: 'Time', message: 'Message', page: 'Sent from' };

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json(400, { error: 'bad_json' }); }
  if (data.company) return json(200, { ok: true });                     // honeypot: pretend success for bots

  const lead = {};
  for (const k of FIELDS) if (data[k] != null && data[k] !== '') lead[k] = String(data[k]).slice(0, k === 'message' ? 2000 : 200).trim();
  if (!['tour', 'rental'].includes(lead.kind)) return json(400, { error: 'bad_kind' });
  if (!lead.name || (lead.phone || '').replace(/\D/g, '').length < 10) return json(422, { error: 'missing_fields' });

  if (env.TURNSTILE_SECRET) {
    const token = data['cf-turnstile-response'];
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token || '', remoteip: request.headers.get('CF-Connecting-IP') || '' }),
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!v.success) return json(403, { error: 'challenge_failed' });
  }

  if (!env.RESEND_API_KEY && !env.LEAD_WEBHOOK_URL) return json(503, { error: 'not_configured' });

  const route = lead.kind === 'tour' ? ROUTES.tour : ROUTES[`rental:${lead.location}`] || ROUTES['rental:dearborn-heights'];
  const to = route(env);
  const subject = lead.kind === 'tour'
    ? `Tour request: ${lead.name} (${lead.location || 'any center'})`
    : `Rental inquiry: ${lead.name}, ${lead.eventType || 'event'} at ${lead.location}`;
  const rows = Object.entries(lead).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${LABELS[k] || k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('');
  const html = `<h2 style="font-family:sans-serif">${esc(subject)}</h2><table style="font-family:sans-serif;font-size:14px">${rows}</table>` +
    (lead.phone ? `<p style="font-family:sans-serif"><a href="tel:${esc(lead.phone)}">Call ${esc(lead.name)}</a> · <a href="sms:${esc(lead.phone)}">Text</a></p>` : '');

  const jobs = [];
  if (env.RESEND_API_KEY) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.LEAD_FROM || 'HYPE Website <onboarding@resend.dev>', to: [to], reply_to: lead.email || undefined, subject, html }),
    }));
  }
  if (env.LEAD_WEBHOOK_URL) {
    jobs.push(fetch(env.LEAD_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ subject, to, ...lead, receivedAt: new Date().toISOString() }) }));
  }
  const results = await Promise.allSettled(jobs);
  const delivered = results.some((r) => r.status === 'fulfilled' && r.value.ok);
  return delivered ? json(200, { ok: true }) : json(502, { error: 'delivery_failed' });
}

export const onRequest = () => json(405, { error: 'method_not_allowed' });
