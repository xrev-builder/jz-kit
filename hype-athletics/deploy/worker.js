// Cloudflare Worker that serves the built site from Workers KV (binding: SITE).
// Used for the shareable preview at hypeathletics.xrev.co. Deployed by deploy/deploy-preview.py.
// REDIRECTS and PREVIEW are injected by the deploy script.
import { handleDayPass } from './daypass.js';
import SITE_TEXT from './site.js';   // pages, CSS, JS (bundled at deploy time)

const REDIRECTS = __REDIRECTS__;
const PREVIEW = __PREVIEW__;

const TYPES = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8',
  json: 'application/json', xml: 'application/xml; charset=utf-8', txt: 'text/plain; charset=utf-8',
  svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  avif: 'image/avif', gif: 'image/gif', ico: 'image/x-icon', woff2: 'font/woff2', woff: 'font/woff',
};

const SECURITY = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-frame-options': 'SAMEORIGIN',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Day pass: verified phone + email (server/daypass.js). On the preview, codes are shown on screen.
    const dp = url.pathname.match(/^\/api\/daypass\/(start|verify|resend)\/?$/);
    if (dp) return handleDayPass(request, env, dp[1]);

    // Other forms: delivery isn't configured on the preview, so the site falls back to call/email buttons.
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: { 'content-type': 'application/json' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });

    let path;
    try { path = decodeURIComponent(url.pathname); } catch { path = url.pathname; }

    const to = REDIRECTS[path] || REDIRECTS[path.endsWith('/') ? path : path + '/'];
    if (to) return Response.redirect(new URL(to, url).toString(), 301);

    // Directory URLs always end in a slash (matches the site's canonical URLs).
    if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) {
      return Response.redirect(url.origin + path + '/' + url.search, 301);
    }

    let key = (path.endsWith('/') ? path + 'index.html' : path).replace(/^\/+/, '');
    let status = 200;
    let body = SITE_TEXT[key] ?? await env.SITE.get(key, { type: 'arrayBuffer', cacheTtl: 300 });
    if (body === null || body === undefined) {
      key = '404.html';
      status = 404;
      body = SITE_TEXT[key];
      if (body === undefined) return new Response('Not found', { status: 404 });
    }

    const ext = key.split('.').pop().toLowerCase();
    const headers = new Headers(SECURITY);
    headers.set('content-type', TYPES[ext] || 'application/octet-stream');
    headers.set('cache-control', key.startsWith('_astro/')
      ? 'public, max-age=31536000, immutable'
      : ext === 'html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=3600');
    if (PREVIEW) headers.set('x-robots-tag', 'noindex, nofollow');

    return new Response(request.method === 'HEAD' ? null : body, { status, headers });
  },
};
