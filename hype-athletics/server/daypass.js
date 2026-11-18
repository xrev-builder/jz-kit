// Free day pass with verified phone AND email.
// Shared by the production Pages Function (functions/api/daypass/[action].js)
// and the preview Worker (deploy/worker.js).
//
// Flow
//   POST /api/daypass/start   {name, email, phone, location, date, adult}  → texts + emails a 6-digit code each
//   POST /api/daypass/verify  {id, smsCode, emailCode}                     → issues the pass
//   POST /api/daypass/resend  {id, channel: 'sms' | 'email'}
//
// Environment
//   DAYPASS (KV binding)       required: pending verifications, issued passes, one-per-person markers
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (or TWILIO_MESSAGING_SERVICE_SID)   SMS codes
//   RESEND_API_KEY, LEAD_FROM                                                             email codes
//   DAYPASS_NOTIFY_TO          front-desk email for each issued pass (default info@hypeathletics.org)
//   DAYPASS_DEMO = "true"      preview only: when SMS/email aren't configured, return the codes in the
//                              response so the flow can be demonstrated. Never set in production.

const CODE_TTL = 10 * 60;               // seconds a code stays valid
const PASS_TTL = 60 * 60 * 24 * 45;     // keep issued passes 45 days
const REPEAT_TTL = 60 * 60 * 24 * 180;  // one free day pass per phone/email every 180 days
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const MAX_STARTS_PER_IP_HOUR = 8;
const LOCATIONS = { 'dearborn-heights': 'HYPE Dearborn Heights · 23302 W. Warren Ave.', wayne: 'HYPE Wayne · 4635 Howe Rd.' };

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function sha(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function code6() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, '0');
}
function token(len, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}
function normPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return null;
}
const fmtPhone = (e164) => `(${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8)}`;
const normEmail = (raw) => {
  const e = String(raw || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200 ? e : null;
};
function fmtDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
function detroitToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Detroit' }); // YYYY-MM-DD
}
function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}

const canSms = (env) => env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && (env.TWILIO_FROM || env.TWILIO_MESSAGING_SERVICE_SID);
const canEmail = (env) => !!env.RESEND_API_KEY;
const demo = (env) => env.DAYPASS_DEMO === 'true' && !(canSms(env) && canEmail(env));

async function sendSms(env, to, body) {
  const form = new URLSearchParams({ To: to, Body: body });
  if (env.TWILIO_MESSAGING_SERVICE_SID) form.set('MessagingServiceSid', env.TWILIO_MESSAGING_SERVICE_SID); else form.set('From', env.TWILIO_FROM);
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { authorization: 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!r.ok) throw new Error(`sms_${r.status}`);
}
async function sendEmail(env, to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.LEAD_FROM || 'HYPE Athletics <onboarding@resend.dev>', to: [to], subject, html }),
  });
  if (!r.ok) throw new Error(`email_${r.status}`);
}
const codeEmail = (name, code) => `<div style="font-family:sans-serif;font-size:16px;line-height:1.5">
  <p>Hi ${esc(name)},</p><p>Your HYPE Athletics day pass code is</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:8px 0">${code}</p>
  <p style="color:#666">It expires in 10 minutes. If you didn’t request a day pass, ignore this email.</p></div>`;

async function deliverCodes(env, p, sms, email, which = 'both') {
  if (demo(env)) return;
  const jobs = [];
  if (which !== 'email') jobs.push(sendSms(env, p.phone, `HYPE Athletics: your day pass code is ${sms}. Expires in 10 min.`));
  if (which !== 'sms') jobs.push(sendEmail(env, p.email, `${email} is your HYPE day pass code`, codeEmail(p.name, email)));
  await Promise.all(jobs);
}

async function rateLimit(env, ip) {
  const key = `rl:${await sha(ip || 'unknown')}:${new Date().toISOString().slice(0, 13)}`;
  const n = parseInt((await env.DAYPASS.get(key)) || '0', 10);
  if (n >= MAX_STARTS_PER_IP_HOUR) return false;
  await env.DAYPASS.put(key, String(n + 1), { expirationTtl: 3700 });
  return true;
}

async function start(request, env) {
  const b = await request.json().catch(() => null);
  if (!b) return json(400, { error: 'bad_json' });
  if (b.company) return json(200, { id: token(16) });                         // honeypot
  const name = String(b.name || '').trim().slice(0, 80);
  const phone = normPhone(b.phone);
  const email = normEmail(b.email);
  const location = LOCATIONS[b.location] ? b.location : null;
  const today = detroitToday();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') && b.date >= today && b.date <= addDays(today, 14) ? b.date : null;
  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!phone) errors.phone = 'Enter a 10-digit US mobile number.';
  if (!email) errors.email = 'Enter a valid email address.';
  if (!location) errors.location = 'Choose a center.';
  if (!date) errors.date = 'Choose a day within the next two weeks.';
  if (b.adult !== true) errors.adult = 'Day passes are for adults 18 and over.';
  if (Object.keys(errors).length) return json(422, { error: 'invalid', fields: errors });

  if (!demo(env) && !(canSms(env) && canEmail(env))) return json(503, { error: 'not_configured' });
  if (!(await rateLimit(env, request.headers.get('CF-Connecting-IP')))) return json(429, { error: 'too_many' });

  const [ph, eh] = await Promise.all([sha(`p:${phone}`), sha(`e:${email}`)]);
  if (!demo(env)) {
    const [usedP, usedE] = await Promise.all([env.DAYPASS.get(`used:${ph}`), env.DAYPASS.get(`used:${eh}`)]);
    if (usedP || usedE) return json(409, { error: 'already_used' });
  }

  const id = token(20);
  const sms = code6(), mail = code6();
  const pending = { name, phone, email, location, date, ph, eh, sms: await sha(`${id}:${sms}`), mail: await sha(`${id}:${mail}`), attempts: 0, resends: 0 };
  await env.DAYPASS.put(`pending:${id}`, JSON.stringify(pending), { expirationTtl: CODE_TTL });
  try { await deliverCodes(env, pending, sms, mail); }
  catch (e) { return json(502, { error: 'delivery_failed', detail: String(e.message || e) }); }

  return json(200, {
    id, phone: fmtPhone(phone), email,
    ...(demo(env) ? { demo: { sms, email: mail } } : {}),
  });
}

async function verify(request, env) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b.id !== 'string') return json(400, { error: 'bad_request' });
  const key = `pending:${b.id}`;
  const raw = await env.DAYPASS.get(key);
  if (!raw) return json(410, { error: 'expired' });
  const p = JSON.parse(raw);
  if (p.attempts >= MAX_ATTEMPTS) { await env.DAYPASS.delete(key); return json(429, { error: 'too_many_attempts' }); }
  const smsOk = (await sha(`${b.id}:${String(b.smsCode || '').replace(/\D/g, '')}`)) === p.sms;
  const mailOk = (await sha(`${b.id}:${String(b.emailCode || '').replace(/\D/g, '')}`)) === p.mail;
  if (!smsOk || !mailOk) {
    p.attempts += 1;
    await env.DAYPASS.put(key, JSON.stringify(p), { expirationTtl: CODE_TTL });
    return json(401, { error: 'wrong_code', sms: smsOk, email: mailOk, left: MAX_ATTEMPTS - p.attempts });
  }

  const passId = `HYPE-${token(6)}`;
  const pass = { passId, name: p.name, phone: p.phone, email: p.email, location: p.location, date: p.date, issuedAt: new Date().toISOString() };
  await Promise.all([
    env.DAYPASS.put(`pass:${passId}`, JSON.stringify(pass), { expirationTtl: PASS_TTL }),
    env.DAYPASS.put(`used:${p.ph}`, passId, { expirationTtl: REPEAT_TTL }),
    env.DAYPASS.put(`used:${p.eh}`, passId, { expirationTtl: REPEAT_TTL }),
    env.DAYPASS.delete(key),
  ]);

  // Confirmations and front-desk notice. Failures here don't block the pass.
  if (!demo(env)) {
    const where = LOCATIONS[p.location];
    const day = fmtDate(p.date);
    await Promise.allSettled([
      sendSms(env, p.phone, `Your HYPE day pass ${passId} is good for ${day} at ${where}. Show this text and a photo ID at the front desk.`),
      sendEmail(env, p.email, `Your HYPE day pass for ${day}`, `<div style="font-family:sans-serif;font-size:16px;line-height:1.5">
        <p>See you soon, ${esc(p.name)}!</p><p style="font-size:28px;font-weight:700;letter-spacing:3px">${passId}</p>
        <p><b>${esc(day)}</b><br>${esc(where)}</p>
        <p>Show this pass and a photo ID at the front desk. You’ll sign a quick liability waiver before your workout.</p>
        <p><a href="https://hypeathletics.org/membership/">Ready to join? See membership plans</a></p></div>`),
      sendEmail(env, env.DAYPASS_NOTIFY_TO || 'info@hypeathletics.org', `Day pass ${passId}: ${p.name}, ${day}`,
        `<div style="font-family:sans-serif;font-size:14px"><p><b>${passId}</b> · ${esc(day)} · ${esc(where)}</p>
        <p>${esc(p.name)}<br>${esc(fmtPhone(p.phone))} (verified)<br>${esc(p.email)} (verified)</p>
        <p>Follow up after their visit to offer a membership.</p></div>`),
    ]);
  }
  return json(200, { passId, name: p.name, location: p.location, locationLabel: LOCATIONS[p.location], date: p.date, dateLabel: fmtDate(p.date) });
}

async function resend(request, env) {
  const b = await request.json().catch(() => null);
  if (!b || typeof b.id !== 'string' || !['sms', 'email'].includes(b.channel)) return json(400, { error: 'bad_request' });
  const key = `pending:${b.id}`;
  const raw = await env.DAYPASS.get(key);
  if (!raw) return json(410, { error: 'expired' });
  const p = JSON.parse(raw);
  if (p.resends >= MAX_RESENDS) return json(429, { error: 'too_many_resends' });
  const fresh = code6();
  if (b.channel === 'sms') p.sms = await sha(`${b.id}:${fresh}`); else p.mail = await sha(`${b.id}:${fresh}`);
  p.resends += 1;
  await env.DAYPASS.put(key, JSON.stringify(p), { expirationTtl: CODE_TTL });
  try {
    await deliverCodes(env, p, b.channel === 'sms' ? fresh : null, b.channel === 'email' ? fresh : null, b.channel);
  } catch (e) { return json(502, { error: 'delivery_failed' }); }
  return json(200, { ok: true, ...(demo(env) ? { demo: { [b.channel]: fresh } } : {}) });
}

export async function handleDayPass(request, env, action) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!env.DAYPASS) return json(503, { error: 'not_configured' });
  try {
    if (action === 'start') return await start(request, env);
    if (action === 'verify') return await verify(request, env);
    if (action === 'resend') return await resend(request, env);
    return json(404, { error: 'not_found' });
  } catch (e) {
    return json(500, { error: 'server_error' });
  }
}
