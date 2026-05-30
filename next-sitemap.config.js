/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.countrypick.com',
  generateRobotsTxt: true,
  trailingSlash: false,
  outDir: 'out',     // next build with output:'export' writes to /out

  // Pages we don't want indexed
  exclude: [
    '/',            // bare root — no real content, redirects elsewhere
    '/404',         // error page
    '**/404',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        // No /api/ routes exist (static export), but disallowing is harmless.
        // Do NOT disallow /_next/ — Google needs those assets to render JS pages.
        disallow: ['/404'],
      },
    ],
    additionalSitemaps: [],
  },

  // Assign change frequencies and priorities by path pattern.
  // ORDER MATTERS — more specific patterns must come before broader ones.
  transform: async (config, path) => {
    // 1. Homepage variants
    if (/^\/(en|pt|es|ru)$/.test(path)) {
      return { loc: path, changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() };
    }

    // 2. Category / hub pages
    if (/^\/(en|pt|es|ru)\/(attractions|best-historical-cities|top-natural-places|adventurous-things-to-do)$/.test(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod: new Date().toISOString() };
    }

    // 3. Legal / static pages — check BEFORE the generic country pattern
    if (/^\/(en|pt|es|ru)\/(faq|terms|privacy|cookies|contact)$/.test(path)) {
      return { loc: path, changefreq: 'yearly', priority: 0.3, lastmod: '2026-05-30' };
    }

    // 4. Country pages  e.g. /en/france
    if (/^\/(en|pt|es|ru)\/[^/]+$/.test(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.7, lastmod: new Date().toISOString() };
    }

    // 5. City pages  e.g. /en/france/paris
    if (/^\/(en|pt|es|ru)\/[^/]+\/[^/]+$/.test(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.6, lastmod: new Date().toISOString() };
    }

    // Default fallback
    return { loc: path, changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() };
  },
};

module.exports = config;
