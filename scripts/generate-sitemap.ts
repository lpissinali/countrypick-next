/**
 * scripts/generate-sitemap.ts
 *
 * Generates public/sitemap.xml at build time from the same DB paths used by
 * getStaticPaths — so the sitemap is always in sync with what Next.js exports.
 *
 * Run via:  tsx scripts/generate-sitemap.ts   (prebuild hook in package.json)
 */

import fs from 'fs';
import path from 'path';
import { getAllCountryPaths, getAllCityPaths } from '../lib/queries';
import { getPool } from '../lib/db';

const BASE_URL = 'https://www.countrypick.com';
const TODAY    = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ─── Static / category paths ────────────────────────────────────────────────

const LANGS = ['en', 'pt', 'es', 'ru'];

const STATIC_PATHS: { path: string; changefreq: string; priority: number; lastmod: string }[] = [
  // Lang homepages
  ...LANGS.map(lang => ({
    path:       `/${lang}`,
    changefreq: 'weekly',
    priority:   1.0,
    lastmod:    TODAY,
  })),
  // Category / hub pages
  ...LANGS.flatMap(lang =>
    ['attractions', 'best-historical-cities', 'top-natural-places', 'adventurous-things-to-do'].map(
      cat => ({
        path:       `/${lang}/${cat}`,
        changefreq: 'monthly',
        priority:   0.8,
        lastmod:    TODAY,
      }),
    ),
  ),
  // Legal pages
  ...LANGS.flatMap(lang =>
    ['faq', 'terms', 'privacy', 'cookies'].map(page => ({
      path:       `/${lang}/${page}`,
      changefreq: 'yearly',
      priority:   0.3,
      lastmod:    '2026-05-30',
    })),
  ),
];

// ─── XML helpers ────────────────────────────────────────────────────────────

function urlEntry(
  loc: string,
  changefreq: string,
  priority: number,
  lastmod: string,
): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('⏳  Generating sitemap…');

  const [countryPaths, cityPaths] = await Promise.all([
    getAllCountryPaths(),
    getAllCityPaths(),
  ]);

  const entries: string[] = [];

  // 1. Static paths
  for (const s of STATIC_PATHS) {
    entries.push(urlEntry(s.path, s.changefreq, s.priority, s.lastmod));
  }

  // 2. Country pages  /en/france
  for (const { params } of countryPaths) {
    entries.push(
      urlEntry(`/${params.lang}/${params.identifier}`, 'monthly', 0.7, TODAY),
    );
  }

  // 3. City pages  /en/france/paris
  for (const { params } of cityPaths) {
    entries.push(
      urlEntry(
        `/${params.lang}/${params.identifier}/${params.city}`,
        'monthly',
        0.6,
        TODAY,
      ),
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  const outPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');

  const totalUrls = entries.length;
  console.log(`✅  sitemap.xml written → ${outPath}  (${totalUrls} URLs)`);

  // Close the DB pool so the process exits cleanly
  await getPool().end();
}

main().catch(err => {
  console.error('❌  Sitemap generation failed:', err);
  process.exit(1);
});
