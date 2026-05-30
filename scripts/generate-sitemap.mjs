/**
 * scripts/generate-sitemap.mjs
 * Generates public/sitemap.xml at build time from the same DB paths used by
 * getStaticPaths — keeping the sitemap in sync with what Next.js exports.
 *
 * Run via: node scripts/generate-sitemap.mjs  (prebuild hook)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import * as dotenv from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL   = 'https://www.countrypick.com';
const TODAY      = new Date().toISOString().split('T')[0];
const LANGS      = ['en', 'pt', 'es', 'ru'];

// ─── DB ──────────────────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'countrypick',
  waitForConnections: true,
  connectionLimit: 5,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function query(sql, values) {
  const [rows] = await pool.execute(sql, values ?? []);
  return rows;
}

// ─── Paths ───────────────────────────────────────────────────────────────────

async function getAllCountryPaths() {
  const rows = await query(`
    SELECT identifier, language_name AS languageName
    FROM loccountries WHERE status = 1
  `);
  return rows.map(r => ({ lang: r.languageName.toLowerCase(), identifier: r.identifier }));
}

async function getAllCityPaths() {
  const rows = await query(`
    SELECT LOWER(c.language_name) AS lang,
           c.identifier           AS countryIdentifier,
           g.identifier           AS gemIdentifier
    FROM gems g
    JOIN loccountries c ON c.id = g.country_id
    WHERE c.status = 1
  `);
  return rows.map(r => ({ lang: r.lang, identifier: r.countryIdentifier, city: r.gemIdentifier }));
}

// ─── Static paths ─────────────────────────────────────────────────────────────

const STATIC = [
  ...LANGS.map(l => ({ loc: `/${l}`,                             cf: 'weekly',  pri: 1.0, lm: TODAY })),
  ...LANGS.flatMap(l =>
    ['attractions','best-historical-cities','top-natural-places','adventurous-things-to-do']
      .map(s => ({ loc: `/${l}/${s}`,                            cf: 'monthly', pri: 0.8, lm: TODAY }))
  ),
  ...LANGS.flatMap(l =>
    ['faq','terms','privacy','cookies']
      .map(s => ({ loc: `/${l}/${s}`,                            cf: 'yearly',  pri: 0.3, lm: '2026-05-30' }))
  ),
];

// ─── XML ──────────────────────────────────────────────────────────────────────

function urlEntry(loc, cf, pri, lm) {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lm}</lastmod>
    <changefreq>${cf}</changefreq>
    <priority>${pri.toFixed(1)}</priority>
  </url>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('⏳  Generating sitemap…');

  const [countries, cities] = await Promise.all([getAllCountryPaths(), getAllCityPaths()]);

  const entries = [
    ...STATIC.map(s => urlEntry(s.loc, s.cf, s.pri, s.lm)),
    ...countries.map(p => urlEntry(`/${p.lang}/${p.identifier}`, 'monthly', 0.7, TODAY)),
    ...cities.map(p    => urlEntry(`/${p.lang}/${p.identifier}/${p.city}`, 'monthly', 0.6, TODAY)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  const out = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(out, xml, 'utf-8');
  console.log(`✅  sitemap.xml → ${out}  (${entries.length} URLs)`);

  await pool.end();
}

main().catch(err => { console.error('❌  Sitemap generation failed:', err); process.exit(1); });
