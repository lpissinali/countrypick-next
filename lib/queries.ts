/**
 * All database queries used by getStaticProps / getStaticPaths.
 * Runs at build time only — never in the browser.
 */
import { query } from './db';
import type { Lang, Country, Gem, GemWithThings, Thing, FooterContinent } from '@/types';

// ─── Countries ────────────────────────────────────────────────────────────────

export async function getAllCountries(lang: Lang): Promise<Country[]> {
  return query<Country>(`
    SELECT
      c.id,
      c.countryName  AS name,
      c.shortCountry AS shortName,
      c.identifier,
      c.alpha2,
      c.dialCode,
      c.desc         AS description,
      c.capital,
      c.currency,
      c.language,
      c.language_name AS languageName,
      c.iata,
      con.id         AS 'continent.id',
      con.name       AS 'continent.name'
    FROM loccountries c
    LEFT JOIN loccontinents con ON con.id = c.continent_id
                               AND con.language_name = c.language_name
    WHERE c.language_name = ? AND c.status = 1
    ORDER BY c.countryName ASC
  `, [lang.toUpperCase()]);
}

export async function getCountryByIdentifier(
  identifier: string,
  lang: Lang
): Promise<Country | null> {
  const rows = await query<Country>(`
    SELECT
      c.id,
      c.countryName  AS name,
      c.shortCountry AS shortName,
      c.identifier,
      c.alpha2,
      c.dialCode,
      c.desc         AS description,
      c.capital,
      c.currency,
      c.language,
      c.language_name AS languageName,
      c.iata,
      con.id         AS 'continent.id',
      con.name       AS 'continent.name'
    FROM loccountries c
    LEFT JOIN loccontinents con ON con.id = c.continent_id
                               AND con.language_name = c.language_name
    WHERE c.identifier = ? AND c.language_name = ? AND c.status = 1
    LIMIT 1
  `, [identifier, lang.toUpperCase()]);

  return rows[0] ?? null;
}

// ─── Gems (cities/areas) ──────────────────────────────────────────────────────

export async function getGemsByCountry(countryId: number): Promise<Gem[]> {
  const rows = await query<Gem>(`
    SELECT
      id,
      identifier,
      gems_name    AS name,
      gems_description AS description,
      city_id      AS cityId
    FROM gems
    WHERE country_id = ?
    ORDER BY id ASC
  `, [countryId]);

  return rows.map(g => ({
    ...g,
    imageSlug: toImageSlug(g.name),
  }));
}

export async function getGemByIdentifier(
  identifier: string,
  countryIdentifier: string,
  lang: Lang
): Promise<Gem | null> {
  const rows = await query<Gem & { countryAlpha2: string }>(`
    SELECT
      g.id,
      g.identifier,
      g.gems_name        AS name,
      g.gems_description AS description,
      g.city_id          AS cityId,
      c.alpha2           AS countryAlpha2
    FROM gems g
    JOIN loccountries c ON c.id = g.country_id
    WHERE g.identifier = ?
      AND c.identifier = ?
      AND c.language_name = ?
    LIMIT 1
  `, [identifier, countryIdentifier, lang.toUpperCase()]);

  if (!rows[0]) return null;
  const g = rows[0];
  return { ...g, imageSlug: toImageSlug(g.name) };
}

export async function getGemWithThings(gemId: number): Promise<Thing[]> {
  return query<Thing>(`
    SELECT
      id,
      title,
      description,
      url,
      link,
      additional_information AS additionalInformation
    FROM things
    WHERE gem_id = ?
    ORDER BY id ASC
  `, [gemId]);
}

export async function getGemsWithThingsByCountry(
  countryId: number
): Promise<GemWithThings[]> {
  const gems = await getGemsByCountry(countryId);
  return Promise.all(
    gems.map(async g => ({
      ...g,
      things: await getGemWithThings(g.id),
    }))
  );
}

// ─── Footer continents ────────────────────────────────────────────────────────

export async function getFooterContinents(lang: Lang): Promise<FooterContinent[]> {
  type Row = { continentName: string; countryName: string; identifier: string };
  const rows = await query<Row>(`
    SELECT
      con.name  AS continentName,
      c.countryName AS countryName,
      c.identifier
    FROM loccontinents con
    JOIN loccountries c ON c.continent_id = con.id
                       AND c.language_name = con.language_name
    WHERE con.language_name = ? AND c.status = 1
    ORDER BY con.name ASC, c.countryName ASC
  `, [lang.toUpperCase()]);

  const map = new Map<string, FooterContinent>();
  for (const row of rows) {
    if (!map.has(row.continentName)) {
      map.set(row.continentName, { name: row.continentName, countries: [] });
    }
    map.get(row.continentName)!.countries.push({
      name: row.countryName,
      identifier: row.identifier,
    });
  }
  return Array.from(map.values());
}

// ─── Global gems (cross-country) ─────────────────────────────────────────────

/** Gem with its country identifier and name — used for cross-country sidebar. */
export interface GemWithCountry extends Gem {
  countryIdentifier: string;
  countryName:       string;
  countryAlpha2:     string;
}

/**
 * Fetch all gems across every country (build-time only).
 * Result is cached in module memory so the DB is only queried once per build,
 * regardless of how many city pages are generated in parallel.
 */
let _allGemsPromise: Promise<GemWithCountry[]> | null = null;

export function getAllGems(): Promise<GemWithCountry[]> {
  if (_allGemsPromise) return _allGemsPromise;
  _allGemsPromise = query<GemWithCountry>(`
    SELECT
      g.id,
      g.identifier,
      g.gems_name        AS name,
      g.gems_description AS description,
      g.city_id          AS cityId,
      c.identifier       AS countryIdentifier,
      c.countryName      AS countryName,
      c.alpha2           AS countryAlpha2
    FROM gems g
    JOIN loccountries c ON c.id = g.country_id
    WHERE c.status = 1 AND c.language_name = 'EN'
  `).then(rows => rows.map(g => ({ ...g, imageSlug: toImageSlug(g.name) })));
  return _allGemsPromise;
}

// ─── Gem coordinates (derived from things' Google Places data) ───────────────

export interface GemCoord {
  id:                number;
  identifier:        string;
  name:              string;
  countryIdentifier: string;
  countryName:       string;
  countryAlpha2:     string;
  lat:               number | null;
  lng:               number | null;
}

export interface NearbyGem extends GemCoord {
  distKm: number | null; // null when falling back to same-country list
}

/** Strip HTML tags — mirrors extractMarkerJson used on the city page. */
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim();
}

/**
 * Returns all gems with approximate centre coordinates derived by averaging
 * the lat/lng of their Things' additionalInformation (Google Places JSON).
 * Gems with no usable marker data get lat/lng = null.
 * Result is cached for the entire build.
 */
let _gemCoordsPromise: Promise<GemCoord[]> | null = null;

export function getAllGemCoords(): Promise<GemCoord[]> {
  if (_gemCoordsPromise) return _gemCoordsPromise;

  _gemCoordsPromise = (async () => {
    // 1. Fetch all gems (reuse the already-cached call)
    const gems = await getAllGems();

    // 2. Fetch raw additional_information for every thing that has it
    type ThingRow = { gemId: number; info: string };
    const thingRows = await query<ThingRow>(`
      SELECT gem_id AS gemId, additional_information AS info
      FROM things
      WHERE additional_information IS NOT NULL AND additional_information != ''
    `);

    // 3. Build a map: gemId → [lat, lng][]
    const coordMap = new Map<number, { lat: number; lng: number }[]>();
    for (const row of thingRows) {
      try {
        const cleaned = stripHtml(row.info);
        const parsed  = JSON.parse(cleaned);
        const lat = parsed?.geometry?.location?.lat;
        const lng = parsed?.geometry?.location?.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
          const arr = coordMap.get(row.gemId) ?? [];
          arr.push({ lat, lng });
          coordMap.set(row.gemId, arr);
        }
      } catch {
        // unparseable — skip
      }
    }

    // 4. Average coordinates per gem
    return gems.map(g => {
      const pts = coordMap.get(g.id);
      if (!pts || pts.length === 0) {
        return { ...g, lat: null, lng: null };
      }
      const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
      const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
      return { ...g, lat, lng };
    });
  })();

  return _gemCoordsPromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert gem name to the slug used in ImageKit paths (mirrors Go logic). */
function toImageSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // strip diacritics
}

/** Build all [lang, identifier] pairs for getStaticPaths on country pages. */
/** Returns active languages from the languages table. */
export async function getActiveLangs(): Promise<{ code: string; name: string }[]> {
  const rows = await query<{ value: string; name: string }>(
    'SELECT value, name FROM languages WHERE is_active = 1 ORDER BY sort ASC'
  );
  return rows.map(r => ({ code: r.value.toLowerCase(), name: r.name }));
}

export async function getAllCountryPaths(): Promise<
  { params: { lang: string; identifier: string } }[]
> {
  type Row = { identifier: string; languageName: string };
  const rows = await query<Row>(`
    SELECT identifier, language_name AS languageName
    FROM loccountries
    WHERE status = 1
  `);
  return rows.map(r => ({
    params: { lang: r.languageName.toLowerCase(), identifier: r.identifier },
  }));
}

/** Build all [lang, identifier, city] paths for getStaticPaths on city pages. */
export async function getAllCityPaths(): Promise<
  { params: { lang: string; identifier: string; city: string } }[]
> {
  type Row = { lang: string; countryIdentifier: string; gemIdentifier: string };
  const rows = await query<Row>(`
    SELECT
      LOWER(c.language_name) AS lang,
      c.identifier           AS countryIdentifier,
      g.identifier           AS gemIdentifier
    FROM gems g
    JOIN loccountries c ON c.id = g.country_id
    WHERE c.status = 1
  `);
  return rows.map(r => ({
    params: {
      lang:       r.lang,
      identifier: r.countryIdentifier,
      city:       r.gemIdentifier,
    },
  }));
}
