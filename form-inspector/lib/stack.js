'use strict';

// Passive site-stack detection (BUILD-SPEC section 23).
//
// Every input is a by-product of the baseline load: the committed top-level document's
// response headers, the subresource request hosts, the main frame's script[src] URLs, its
// generator meta tag and a fixed list of DOM markers. No DNS, no WHOIS, no probing, no
// second request.
//
// This is what the site REPORTS, not an inventory. `high` means a distinctive provider
// signature matched; `medium` means a generic or indirect signal.

const { hostOf, hostEndsWith } = require('./providers');

// ---- 23.1 header capture --------------------------------------------------------------

// Value kept, newlines removed, cut at 120.
const VALUE_HEADERS = Object.freeze(['server', 'via', 'x-powered-by', 'x-cache', 'x-served-by',
  'cf-cache-status', 'x-amz-cf-pop', 'x-cdn', 'x-generator', 'x-litespeed-cache',
  'x-kinsta-cache', 'x-pantheon-styx-hostname', 'x-hs-cache-config', 'x-shopify-stage',
  'x-drupal-cache', 'x-aspnet-version', 'x-nextjs-cache']);

// These carry request ids, so only a flag is kept. Never the value.
const PRESENCE_HEADERS = Object.freeze(['cf-ray', 'x-amz-cf-id', 'x-vercel-id', 'x-nf-request-id',
  'x-fastly-request-id', 'x-github-request-id', 'x-azure-ref', 'x-sucuri-id',
  'x-akamai-transformed', 'x-akamai-request-id', 'x-wix-request-id', 'fly-request-id',
  'wpe-backend', 'x-hs-hub-id', 'x-hubspot-correlation-id', 'x-sitecore', 'x-iinfo',
  'x-squarespace-did', 'x-wf-region', 'x-pardot-rsp', 'x-pardot-route',
  'strict-transport-security']);

const CAPTURED = new Set([...VALUE_HEADERS, ...PRESENCE_HEADERS]);

// Cookies, authorization and every other header never enter the result.
function pickHeaders(raw) {
  const headers = {};
  const headerFlags = [];
  if (!raw || typeof raw !== 'object') return { headers, headerFlags };
  const lowered = {};
  for (const [name, value] of Object.entries(raw)) lowered[String(name).toLowerCase()] = value;

  for (const name of VALUE_HEADERS) {
    const value = lowered[name];
    if (value === undefined || value === null) continue;
    const text = String(Array.isArray(value) ? value.join(', ') : value).replace(/[\r\n]+/g, ' ').trim();
    if (text) headers[name] = text.length > 120 ? text.slice(0, 120) : text;
  }
  for (const name of PRESENCE_HEADERS) {
    if (lowered[name] !== undefined && lowered[name] !== null) headerFlags.push(name);
  }
  return { headers, headerFlags };
}

// ---- 23.3 rule catalog ------------------------------------------------------------------
//
// Every rule carries a sample that makes it fire. stack.test.js walks the whole catalog and
// a rule cannot ship without a case.

const FASTLY_NODE = /cache-[a-z]{3}(-[a-z]{4})?\d{3,}-[A-Z]{3}/;

const h = (ctx, name) => ctx.headers[name] || '';
const flagged = (ctx, name) => ctx.headerFlags.has(name);

const HEADER_RULES = [
  // edge CDN, from the MAIN document's headers
  { category: 'edgeCdn', name: 'Cloudflare', confidence: 'high', reads: ['cf-ray', 'server'],
    test: (c) => (flagged(c, 'cf-ray') && 'cf-ray header present') || (/cloudflare/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`),
    sample: { headerFlags: ['cf-ray'] } },
  { category: 'edgeCdn', name: 'Amazon CloudFront', confidence: 'high', reads: ['x-amz-cf-id', 'via', 'x-cache', 'x-amz-cf-pop'],
    test: (c) => (flagged(c, 'x-amz-cf-id') && 'x-amz-cf-id header present') ||
      (/cloudfront/i.test(h(c, 'via')) && `via: ${h(c, 'via')}`) ||
      (/cloudfront/i.test(h(c, 'x-cache')) && `x-cache: ${h(c, 'x-cache')}`),
    sample: { headerFlags: ['x-amz-cf-id'] } },
  { category: 'edgeCdn', name: 'Fastly', confidence: 'high', reads: ['x-fastly-request-id', 'x-served-by'],
    test: (c) => (flagged(c, 'x-fastly-request-id') && 'x-fastly-request-id header present') ||
      (FASTLY_NODE.test(h(c, 'x-served-by')) && `x-served-by: ${h(c, 'x-served-by')}`),
    sample: { headers: { 'x-served-by': 'cache-lga-kjfk8660064-LGA' } } },
  { category: 'edgeCdn', name: 'Akamai', confidence: 'high', reads: ['x-akamai-transformed', 'x-akamai-request-id', 'server'],
    test: (c) => (flagged(c, 'x-akamai-transformed') && 'x-akamai-transformed header present') ||
      (flagged(c, 'x-akamai-request-id') && 'x-akamai-request-id header present') ||
      (/akamaighost/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`),
    sample: { headers: { server: 'AkamaiGHost' } } },
  { category: 'edgeCdn', name: 'Vercel', confidence: 'high', reads: ['x-vercel-id', 'server'],
    test: (c) => (flagged(c, 'x-vercel-id') && 'x-vercel-id header present') ||
      (/vercel/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`),
    sample: { headerFlags: ['x-vercel-id'] } },
  { category: 'edgeCdn', name: 'Netlify', confidence: 'high', reads: ['x-nf-request-id', 'server'],
    test: (c) => (flagged(c, 'x-nf-request-id') && 'x-nf-request-id header present') ||
      (/netlify/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`),
    sample: { headerFlags: ['x-nf-request-id'] } },
  { category: 'edgeCdn', name: 'Azure Front Door', confidence: 'high', reads: ['x-azure-ref'],
    test: (c) => flagged(c, 'x-azure-ref') && 'x-azure-ref header present',
    sample: { headerFlags: ['x-azure-ref'] } },
  { category: 'edgeCdn', name: 'Sucuri', confidence: 'high', reads: ['x-sucuri-id', 'server'],
    test: (c) => (flagged(c, 'x-sucuri-id') && 'x-sucuri-id header present') ||
      (/sucuri/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`),
    sample: { headerFlags: ['x-sucuri-id'] } },
  { category: 'edgeCdn', name: 'Imperva', confidence: 'high', reads: ['x-iinfo'],
    test: (c) => flagged(c, 'x-iinfo') && 'x-iinfo header present',
    sample: { headerFlags: ['x-iinfo'] } },
  { category: 'edgeCdn', name: 'GitHub Pages', confidence: 'high', reads: ['x-github-request-id', 'server'],
    test: (c) => (flagged(c, 'x-github-request-id') && 'x-github-request-id header present') ||
      (/github\.com/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`),
    sample: { headerFlags: ['x-github-request-id'] } },
  { category: 'edgeCdn', name: 'Fly.io', confidence: 'high', reads: ['fly-request-id'],
    test: (c) => flagged(c, 'fly-request-id') && 'fly-request-id header present',
    sample: { headerFlags: ['fly-request-id'] } },
  { category: 'edgeCdn', name: 'Google Cloud load balancer', confidence: 'medium', reads: ['via'],
    test: (c) => /(^|[, ])1\.1 google/i.test(h(c, 'via')) && `via: ${h(c, 'via')}`,
    sample: { headers: { via: '1.1 google' } } },

  // hosting
  { category: 'hosting', name: 'WP Engine', confidence: 'high', reads: ['wpe-backend', 'x-powered-by'],
    test: (c) => (flagged(c, 'wpe-backend') && 'wpe-backend header present') ||
      (/wp engine/i.test(h(c, 'x-powered-by')) && `x-powered-by: ${h(c, 'x-powered-by')}`),
    sample: { headers: { 'x-powered-by': 'WP Engine' } } },
  { category: 'hosting', name: 'Kinsta', confidence: 'high', reads: ['x-kinsta-cache'],
    test: (c) => h(c, 'x-kinsta-cache') && `x-kinsta-cache: ${h(c, 'x-kinsta-cache')}`,
    sample: { headers: { 'x-kinsta-cache': 'HIT' } } },
  { category: 'hosting', name: 'Pantheon', confidence: 'high', reads: ['x-pantheon-styx-hostname'],
    test: (c) => h(c, 'x-pantheon-styx-hostname') && 'x-pantheon-styx-hostname header present',
    sample: { headers: { 'x-pantheon-styx-hostname': 'styx-fe1' } } },
  { category: 'hosting', name: 'HubSpot CMS hosting', confidence: 'high', reads: ['x-hs-hub-id', 'x-hubspot-correlation-id', 'x-hs-cache-config'],
    test: (c) => (flagged(c, 'x-hs-hub-id') && 'x-hs-hub-id header present') ||
      (flagged(c, 'x-hubspot-correlation-id') && 'x-hubspot-correlation-id header present') ||
      (h(c, 'x-hs-cache-config') && 'x-hs-cache-config header present'),
    sample: { headerFlags: ['x-hs-hub-id'] } },
  { category: 'hosting', name: 'Shopify', confidence: 'high', reads: ['x-shopify-stage'],
    test: (c) => h(c, 'x-shopify-stage') && `x-shopify-stage: ${h(c, 'x-shopify-stage')}`,
    sample: { headers: { 'x-shopify-stage': 'production' } } },
  { category: 'hosting', name: 'Wix', confidence: 'high', reads: ['x-wix-request-id'],
    test: (c) => flagged(c, 'x-wix-request-id') && 'x-wix-request-id header present',
    sample: { headerFlags: ['x-wix-request-id'] } },
  { category: 'hosting', name: 'Squarespace', confidence: 'high', reads: ['x-squarespace-did'],
    test: (c) => flagged(c, 'x-squarespace-did') && 'x-squarespace-did header present',
    sample: { headerFlags: ['x-squarespace-did'] } },
  { category: 'hosting', name: 'Webflow', confidence: 'high', reads: ['x-wf-region'],
    test: (c) => flagged(c, 'x-wf-region') && 'x-wf-region header present',
    sample: { headerFlags: ['x-wf-region'] } },
  { category: 'hosting', name: 'Pardot hosted page', confidence: 'high', reads: ['x-pardot-rsp', 'x-pardot-route'],
    test: (c) => (flagged(c, 'x-pardot-rsp') && 'x-pardot-rsp header present') ||
      (flagged(c, 'x-pardot-route') && 'x-pardot-route header present'),
    sample: { headerFlags: ['x-pardot-route'] } },
  { category: 'hosting', name: 'Amazon S3', confidence: 'high', reads: ['server'],
    test: (c) => /amazons3/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'AmazonS3' } } },
  { category: 'hosting', name: 'Google Cloud frontend', confidence: 'medium', reads: ['server'],
    test: (c) => /google frontend|gfe/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'Google Frontend' } } },

  // server banners
  { category: 'server', name: 'nginx', confidence: 'medium', reads: ['server'],
    test: (c) => /^nginx/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'nginx/1.24.0' } } },
  { category: 'server', name: 'Apache', confidence: 'medium', reads: ['server'],
    test: (c) => /^apache/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'Apache/2.4.58 (Ubuntu)' } } },
  { category: 'server', name: 'LiteSpeed', confidence: 'high', reads: ['server', 'x-litespeed-cache'],
    test: (c) => (/litespeed/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`) ||
      (h(c, 'x-litespeed-cache') && `x-litespeed-cache: ${h(c, 'x-litespeed-cache')}`),
    sample: { headers: { server: 'LiteSpeed' } } },
  { category: 'server', name: 'Microsoft IIS', confidence: 'medium', reads: ['server'],
    test: (c) => /microsoft-iis/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'Microsoft-IIS/10.0' } } },
  { category: 'server', name: 'OpenResty', confidence: 'medium', reads: ['server'],
    test: (c) => /openresty/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'openresty/1.21.4.1' } } },
  { category: 'server', name: 'Caddy', confidence: 'medium', reads: ['server'],
    test: (c) => /^caddy/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'Caddy' } } },
  { category: 'server', name: 'Envoy', confidence: 'medium', reads: ['server'],
    test: (c) => /^envoy/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'envoy' } } },
  { category: 'server', name: 'Gunicorn', confidence: 'medium', reads: ['server'],
    test: (c) => /gunicorn/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'gunicorn' } } },
  { category: 'server', name: 'Kestrel', confidence: 'medium', reads: ['server'],
    test: (c) => /kestrel/i.test(h(c, 'server')) && `server: ${h(c, 'server')}`,
    sample: { headers: { server: 'Kestrel' } } },

  // frameworks
  { category: 'frameworks', name: 'PHP', confidence: 'medium', reads: ['x-powered-by'],
    test: (c) => /php/i.test(h(c, 'x-powered-by')) && `x-powered-by: ${h(c, 'x-powered-by')}`,
    sample: { headers: { 'x-powered-by': 'PHP/8.2.12' } } },
  { category: 'frameworks', name: 'ASP.NET', confidence: 'high', reads: ['x-aspnet-version', 'x-powered-by'],
    test: (c) => (h(c, 'x-aspnet-version') && `x-aspnet-version: ${h(c, 'x-aspnet-version')}`) ||
      (/asp\.net/i.test(h(c, 'x-powered-by')) && `x-powered-by: ${h(c, 'x-powered-by')}`),
    sample: { headers: { 'x-aspnet-version': '4.0.30319' } } },
  { category: 'frameworks', name: 'Express', confidence: 'medium', reads: ['x-powered-by'],
    test: (c) => /^express$/i.test(h(c, 'x-powered-by')) && `x-powered-by: ${h(c, 'x-powered-by')}`,
    sample: { headers: { 'x-powered-by': 'Express' } } },
  { category: 'frameworks', name: 'Next.js', confidence: 'high', reads: ['x-nextjs-cache'],
    test: (c) => h(c, 'x-nextjs-cache') && `x-nextjs-cache: ${h(c, 'x-nextjs-cache')}`,
    sample: { headers: { 'x-nextjs-cache': 'HIT' } } },

  // CMS from headers
  { category: 'cms', name: 'Drupal', confidence: 'high', reads: ['x-drupal-cache', 'x-generator'],
    test: (c) => (h(c, 'x-drupal-cache') && `x-drupal-cache: ${h(c, 'x-drupal-cache')}`) ||
      (/drupal/i.test(h(c, 'x-generator')) && `x-generator: ${h(c, 'x-generator')}`),
    sample: { headers: { 'x-drupal-cache': 'MISS' } } },
  { category: 'cms', name: 'Sitecore', confidence: 'high', reads: ['x-sitecore'],
    test: (c) => flagged(c, 'x-sitecore') && 'x-sitecore header present',
    sample: { headerFlags: ['x-sitecore'] } },
];

// generator meta tag (high) and DOM markers (medium)
const GENERATOR_RULES = [
  { category: 'cms', name: 'WordPress', confidence: 'high', pattern: /wordpress/i, sample: 'WordPress 6.4.2' },
  { category: 'cms', name: 'Drupal', confidence: 'high', pattern: /drupal/i, sample: 'Drupal 10 (https://www.drupal.org)' },
  { category: 'cms', name: 'Joomla', confidence: 'high', pattern: /joomla/i, sample: 'Joomla! - Open Source Content Management' },
  { category: 'cms', name: 'TYPO3', confidence: 'high', pattern: /typo3/i, sample: 'TYPO3 CMS' },
  { category: 'cms', name: 'Craft CMS', confidence: 'high', pattern: /craft\s*cms/i, sample: 'Craft CMS' },
  { category: 'cms', name: 'Ghost', confidence: 'high', pattern: /ghost/i, sample: 'Ghost 5.75' },
  { category: 'cms', name: 'HubSpot CMS', confidence: 'high', pattern: /hubspot/i, sample: 'HubSpot' },
  { category: 'cms', name: 'Elementor', confidence: 'high', pattern: /elementor/i, sample: 'Elementor 3.18.3' },
  { category: 'cms', name: 'Shopify', confidence: 'high', pattern: /shopify/i, sample: 'Shopify' },
  { category: 'cms', name: 'Wix', confidence: 'high', pattern: /wix\.com|wix website builder/i, sample: 'Wix.com Website Builder' },
  { category: 'cms', name: 'Squarespace', confidence: 'high', pattern: /squarespace/i, sample: 'Squarespace' },
];

const MARKER_RULES = [
  { category: 'cms', name: 'WordPress', confidence: 'medium', markers: ['wp-content', 'wp-includes'] },
  { category: 'cms', name: 'Drupal', confidence: 'medium', markers: ['drupal-settings'] },
  { category: 'cms', name: 'Joomla', confidence: 'medium', markers: ['joomla'] },
  { category: 'cms', name: 'Shopify', confidence: 'medium', markers: ['shopify'] },
  { category: 'cms', name: 'Wix', confidence: 'medium', markers: ['wix'] },
  { category: 'cms', name: 'Squarespace', confidence: 'medium', markers: ['squarespace'] },
  { category: 'cms', name: 'Webflow', confidence: 'medium', markers: ['webflow'] },
  { category: 'cms', name: 'Ghost', confidence: 'medium', markers: ['ghost'] },
  { category: 'cms', name: 'Sitecore', confidence: 'medium', markers: ['sitecore-media'] },
  { category: 'cms', name: 'Sitecore JSS', confidence: 'medium', markers: ['sitecore-jss'] },
  { category: 'cms', name: 'TYPO3', confidence: 'medium', markers: ['typo3'] },
  { category: 'cms', name: 'Craft CMS', confidence: 'medium', markers: ['craft'] },
  { category: 'cms', name: 'Elementor', confidence: 'medium', markers: ['elementor'] },
  { category: 'cms', name: 'Adobe Experience Manager', confidence: 'medium', markers: ['aem'] },
  { category: 'cms', name: 'HubSpot CMS', confidence: 'medium', markers: ['hubspot-cms'] },
  { category: 'frameworks', name: 'Next.js', confidence: 'medium', markers: ['next-data'] },
  { category: 'frameworks', name: 'Nuxt', confidence: 'medium', markers: ['nuxt-data'] },
];

// Host-suffix rules. `path` gates a host shared by several products.
const HOST_RULES = [
  // asset CDNs. Never the site's own edge.
  { category: 'assetCdn', name: 'jsDelivr', confidence: 'medium', hosts: ['cdn.jsdelivr.net'] },
  { category: 'assetCdn', name: 'cdnjs', confidence: 'medium', hosts: ['cdnjs.cloudflare.com'] },
  { category: 'assetCdn', name: 'unpkg', confidence: 'medium', hosts: ['unpkg.com'] },
  { category: 'assetCdn', name: 'Google Fonts', confidence: 'medium', hosts: ['fonts.googleapis.com', 'fonts.gstatic.com'] },
  { category: 'assetCdn', name: 'Amazon CloudFront', confidence: 'medium', hosts: ['cloudfront.net'] },
  { category: 'assetCdn', name: 'Akamai', confidence: 'medium', hosts: ['akamaized.net', 'akamaihd.net'] },
  { category: 'assetCdn', name: 'Fastly', confidence: 'medium', hosts: ['fastly.net', 'fastlylb.net'] },
  { category: 'assetCdn', name: 'Azure CDN', confidence: 'medium', hosts: ['azureedge.net'] },
  { category: 'assetCdn', name: 'BunnyCDN', confidence: 'medium', hosts: ['b-cdn.net'] },
  { category: 'assetCdn', name: 'KeyCDN', confidence: 'medium', hosts: ['kxcdn.com'] },
  { category: 'assetCdn', name: 'Cloudinary', confidence: 'medium', hosts: ['res.cloudinary.com'] },
  { category: 'assetCdn', name: 'imgix', confidence: 'medium', hosts: ['imgix.net'] },
  { category: 'assetCdn', name: 'HubSpot file CDN', confidence: 'medium', hosts: ['hubspotusercontent-na1.net', 'hubspotusercontent00.net', 'cdn2.hubspot.net'] },
  { category: 'assetCdn', name: 'Shopify CDN', confidence: 'medium', hosts: ['cdn.shopify.com'] },

  // tag managers. A shared host is never enough: GTM needs its own path.
  { category: 'tagManagers', name: 'Google Tag Manager', confidence: 'high', hosts: ['googletagmanager.com'], path: /\/gtm\.js/ },
  { category: 'tagManagers', name: 'Google tag (gtag.js)', confidence: 'high', hosts: ['googletagmanager.com'], path: /\/gtag\/js/ },
  { category: 'tagManagers', name: 'Tealium', confidence: 'high', hosts: ['tiqcdn.com'] },
  { category: 'tagManagers', name: 'Adobe Experience Platform Launch', confidence: 'high', hosts: ['adobedtm.com'] },
  { category: 'tagManagers', name: 'Segment', confidence: 'high', hosts: ['cdn.segment.com'] },

  // analytics
  { category: 'analytics', name: 'Google Analytics', confidence: 'high', hosts: ['google-analytics.com', 'analytics.google.com'] },
  { category: 'analytics', name: 'Hotjar', confidence: 'high', hosts: ['hotjar.com', 'hotjar.io'] },
  { category: 'analytics', name: 'Microsoft Clarity', confidence: 'high', hosts: ['clarity.ms'] },
  { category: 'analytics', name: 'Plausible', confidence: 'high', hosts: ['plausible.io'] },
  { category: 'analytics', name: 'Matomo', confidence: 'high', hosts: ['matomo.cloud'] },
  { category: 'analytics', name: 'Mixpanel', confidence: 'high', hosts: ['mixpanel.com', 'mxpnl.com'] },
  { category: 'analytics', name: 'Amplitude', confidence: 'high', hosts: ['amplitude.com'] },
  { category: 'analytics', name: 'Heap', confidence: 'high', hosts: ['heap.io', 'heapanalytics.com'] },
  { category: 'analytics', name: 'FullStory', confidence: 'high', hosts: ['fullstory.com'] },

  // advertising
  { category: 'advertising', name: 'Google Ads conversion', confidence: 'high', hosts: ['googleadservices.com'] },
  { category: 'advertising', name: 'Google advertising network', confidence: 'medium', hosts: ['doubleclick.net', 'googlesyndication.com'] },
  { category: 'advertising', name: 'Meta Pixel', confidence: 'high', hosts: ['connect.facebook.net'], path: /fbevents\.js/ },
  { category: 'advertising', name: 'Microsoft Advertising UET', confidence: 'high', hosts: ['bat.bing.com'] },
  { category: 'advertising', name: 'LinkedIn Insight', confidence: 'high', hosts: ['snap.licdn.com', 'px.ads.linkedin.com'] },
  { category: 'advertising', name: 'TikTok Pixel', confidence: 'high', hosts: ['analytics.tiktok.com'] },
  { category: 'advertising', name: 'Reddit Pixel', confidence: 'high', hosts: ['redditstatic.com'], path: /\/ads\/pixel\.js/ },

  // marketing automation
  { category: 'marketing', name: 'HubSpot', confidence: 'high', hosts: ['hs-scripts.com', 'hsforms.net', 'hsforms.com', 'hs-analytics.net', 'track.hubspot.com'] },
  { category: 'marketing', name: 'Marketo', confidence: 'high', hosts: ['munchkin.marketo.net', 'mktoweb.com'] },
  // pardot.com already covers pi.pardot.com. A nested suffix in the same rule is redundant
  // and makes the look-alike assertion unsatisfiable.
  { category: 'marketing', name: 'Pardot', confidence: 'high', hosts: ['pardot.com'] },
  { category: 'marketing', name: 'SharpSpring', confidence: 'high', hosts: ['marketingautomation.services'] },
  { category: 'marketing', name: 'Klaviyo', confidence: 'high', hosts: ['klaviyo.com'] },
  { category: 'marketing', name: 'ActiveCampaign', confidence: 'high', hosts: ['activehosted.com'] },
  { category: 'marketing', name: 'Mailchimp', confidence: 'high', hosts: ['chimpstatic.com', 'list-manage.com'] },
  { category: 'marketing', name: 'Oracle Eloqua', confidence: 'high', hosts: ['eloqua.com', 'en25.com'] },
  { category: 'marketing', name: 'ZoomInfo', confidence: 'high', hosts: ['ws.zoominfo.com', 'zi-scripts.com'] },
  { category: 'marketing', name: 'Clearbit', confidence: 'high', hosts: ['clearbitjs.com', 'clearbitscripts.com'] },
  { category: 'marketing', name: '6sense', confidence: 'high', hosts: ['6sc.co'] },
  { category: 'marketing', name: 'Demandbase', confidence: 'high', hosts: ['demandbase.com'] },
  { category: 'marketing', name: 'Calendly', confidence: 'high', hosts: ['calendly.com'] },

  // chat
  { category: 'chat', name: 'Intercom', confidence: 'high', hosts: ['intercom.io', 'intercomcdn.com'] },
  { category: 'chat', name: 'Drift', confidence: 'high', hosts: ['drift.com', 'driftt.com'] },
  { category: 'chat', name: 'Zendesk', confidence: 'high', hosts: ['zdassets.com', 'zendesk.com'] },
  { category: 'chat', name: 'Tawk.to', confidence: 'high', hosts: ['tawk.to'] },
  { category: 'chat', name: 'LiveChat', confidence: 'high', hosts: ['livechatinc.com'] },
  { category: 'chat', name: 'Crisp', confidence: 'high', hosts: ['crisp.chat'] },

  // consent
  { category: 'consent', name: 'OneTrust', confidence: 'high', hosts: ['cookielaw.org', 'onetrust.com'] },
  { category: 'consent', name: 'Cookiebot', confidence: 'high', hosts: ['cookiebot.com'] },
  { category: 'consent', name: 'Osano', confidence: 'high', hosts: ['osano.com'] },
  { category: 'consent', name: 'Didomi', confidence: 'high', hosts: ['didomi.io'] },
  { category: 'consent', name: 'TrustArc', confidence: 'high', hosts: ['trustarc.com', 'truste.com'] },
  { category: 'consent', name: 'CookieYes', confidence: 'high', hosts: ['cookieyes.com'] },

  // bot protection
  { category: 'security', name: 'reCAPTCHA', confidence: 'high', hosts: ['www.google.com', 'www.gstatic.com', 'recaptcha.net'], path: /\/recaptcha\// },
  { category: 'security', name: 'hCaptcha', confidence: 'high', hosts: ['hcaptcha.com'] },
  { category: 'security', name: 'Cloudflare Turnstile', confidence: 'high', hosts: ['challenges.cloudflare.com'] },
  { category: 'security', name: 'DataDome', confidence: 'high', hosts: ['datadome.co', 'captcha-delivery.com'] },
  { category: 'security', name: 'PerimeterX', confidence: 'high', hosts: ['px-cloud.net', 'perimeterx.net'] },
  { category: 'security', name: 'Akamai Bot Manager', confidence: 'high', hosts: ['akstat.io'] },
];

const CATEGORIES = Object.freeze(['edgeCdn', 'assetCdn', 'hosting', 'server', 'cms', 'frameworks',
  'tagManagers', 'analytics', 'advertising', 'marketing', 'chat', 'consent', 'security']);

const MAX_HITS = 12;
const MAX_EVIDENCE = 3;

function emptyStack() {
  const stack = {};
  for (const category of CATEGORIES) stack[category] = [];
  return stack;
}

function addHit(stack, category, name, confidence, evidence) {
  const list = stack[category];
  const existing = list.find((entry) => entry.name === name);
  const text = String(evidence).replace(/[\r\n]+/g, ' ').slice(0, 120);
  if (existing) {
    if (existing.evidence.length < MAX_EVIDENCE && !existing.evidence.includes(text)) {
      existing.evidence.push(text);
    }
    if (existing.confidence === 'medium' && confidence === 'high') existing.confidence = 'high';
    return;
  }
  if (list.length >= MAX_HITS) return;
  list.push({ name, confidence, evidence: [text] });
}

// input:
//   documentHeaders   raw headers of the COMMITTED top-level document, same origin as the page
//   subresourceUrls   subresource request URLs (top-level navigations and their hops excluded)
//   scripts           script[src] values from the main frame
//   generator         the generator meta content
//   domMarkers        the fixed marker list, already filtered by sanitize
//   pageHost          the page's own host; never an asset CDN or a vendor
function detectStack(input = {}) {
  const { headers, headerFlags } = pickHeaders(input.documentHeaders);
  const ctx = { headers, headerFlags: new Set(headerFlags) };
  const stack = emptyStack();

  for (const rule of HEADER_RULES) {
    const evidence = rule.test(ctx);
    if (evidence) addHit(stack, rule.category, rule.name, rule.confidence, evidence);
  }

  const generator = typeof input.generator === 'string' ? input.generator : '';
  if (generator) {
    for (const rule of GENERATOR_RULES) {
      if (rule.pattern.test(generator)) {
        addHit(stack, rule.category, rule.name, rule.confidence, `generator meta: ${generator}`);
      }
    }
  }

  const markers = new Set(input.domMarkers || []);
  for (const rule of MARKER_RULES) {
    const found = rule.markers.find((m) => markers.has(m));
    if (found) addHit(stack, rule.category, rule.name, rule.confidence, `markup marker ${found}`);
  }

  const pageHost = String(input.pageHost || '').toLowerCase();
  const urls = [];
  for (const url of input.subresourceUrls || []) urls.push(String(url));
  for (const src of input.scripts || []) urls.push(src.startsWith('//') ? `https:${src}` : String(src));

  for (const url of urls) {
    const host = hostOf(url);
    if (!host || host === 'placeholder.invalid') continue;
    // The site's own host is never an asset CDN or a vendor.
    if (pageHost && (host === pageHost || hostEndsWith(pageHost, host))) continue;
    for (const rule of HOST_RULES) {
      if (!rule.hosts.some((suffix) => hostEndsWith(host, suffix))) continue;
      if (rule.path && !rule.path.test(url)) continue;
      addHit(stack, rule.category, rule.name, rule.confidence, `${host}${rule.path ? ` (${url.slice(0, 60)})` : ''}`);
    }
  }

  return {
    ...stack,
    observed: { headers, headerFlags, fromLoad: 'baseline' },
  };
}

module.exports = {
  detectStack, pickHeaders, emptyStack,
  VALUE_HEADERS, PRESENCE_HEADERS, CAPTURED, CATEGORIES,
  HEADER_RULES, GENERATOR_RULES, MARKER_RULES, HOST_RULES, FASTLY_NODE,
};
