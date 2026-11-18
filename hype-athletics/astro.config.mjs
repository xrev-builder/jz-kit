import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Old WordPress URLs that no longer exist. Cloudflare Pages also reads public/_redirects for true 301s.
const redirects = {
  '/success-stories': '/about-us/',
  '/join-membership': '/membership/',
  '/sample-page': '/',
  '/test': '/rentals/',
  '/blog': '/',
  '/classes-2': '/personal-group-fitness/',
  '/calendar': '/events/',
  '/gala2026': '/events/',
  '/summer-discovery-at-wayne': '/summer-discovery/',
  '/basketball-playoff-brackets': '/basketball/',
};

export default defineConfig({
  site: 'https://hypeathletics.org',
  trailingSlash: 'always',
  redirects,
  integrations: [sitemap()],
  image: { responsiveStyles: false },
  build: { inlineStylesheets: 'auto' },
});
