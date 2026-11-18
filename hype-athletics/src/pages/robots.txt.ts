// robots.txt. Preview builds (PUBLIC_PREVIEW=1) block all crawlers so the preview
// never competes with hypeathletics.org in search results.
import type { APIRoute } from 'astro';

const production = `# Search engines and AI assistants are welcome to read this site.
User-agent: *
Allow: /
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://hypeathletics.org/sitemap-index.xml
`;

const preview = `# Preview build: not for indexing.
User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(import.meta.env.PUBLIC_PREVIEW ? preview : production, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
