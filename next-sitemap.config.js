/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.countrypick.com',
  generateRobotsTxt: true,
  trailingSlash: false,
  // Static export: next-sitemap reads the `out/` directory after `next build`
  outDir: 'out',

  // Pages we don't want indexed
  exclude: [
    // The bare root redirect page has no real content
    '/',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
        ],
      },
    ],
    additionalSitemaps: [
      // If you ever split into multiple sitemaps, list extras here
    ],
  },

  // Assign change frequencies and priorities by path pattern
  transform: async (config, path) => {
    // Homepage variants — highest priority
    if (/^\/(en|pt|es|ru)$/.test(path)) {
      return { loc: path, changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() };
    }

    // Category pages
    if (/^\/(en|pt|es|ru)\/(attractions|best-historical-cities|top-natural-places|adventurous-things-to-do)$/.test(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod: new Date().toISOString() };
    }

    // Country pages
    if (/^\/(en|pt|es|ru)\/[^/]+$/.test(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.7, lastmod: new Date().toISOString() };
    }

    // City pages
    if (/^\/(en|pt|es|ru)\/[^/]+\/[^/]+$/.test(path)) {
      return { loc: path, changefreq: 'monthly', priority: 0.6, lastmod: new Date().toISOString() };
    }

    // Static/legal pages — lower priority
    if (/^\/(en|pt|es|ru)\/(faq|terms|privacy|cookies)$/.test(path)) {
      return { loc: path, changefreq: 'yearly', priority: 0.3, lastmod: '2026-04-25' };
    }

    // Default
    return { loc: path, changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() };
  },
};

module.exports = config;
