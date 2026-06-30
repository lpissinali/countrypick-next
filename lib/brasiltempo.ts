/** Cross-links from Country Pick to our sister site BrasilTempo
 *  (brasiltempo.com.br), a Brazilian weather-forecast site that covers any
 *  city in the world. These links are only relevant on the Portuguese (pt)
 *  locale. Pure data - safe to import anywhere. UTM tags let BrasilTempo
 *  attribute the referral even when rel=noreferrer is used.
 *
 *  BrasilTempo resolves a city by slug at /cidade/{slug}. Its geocoder is
 *  prominence-weighted, so a slugified Portuguese city name resolves to the
 *  right place for the vast majority of real cities (e.g. "sao-francisco" ->
 *  San Francisco, California; "cidade-do-mexico" -> Mexico City). Two cases
 *  need help and are handled below:
 *    1. CITY_SLUG_OVERRIDE — exonym spellings that differ from BrasilTempo's
 *       (e.g. Country Pick stores "Nova York", BrasilTempo expects
 *       "nova-iorque"). Verified entries only.
 *    2. HUB_ONLY — gems that are natural sites or regions, not settlements
 *       (national parks, lakes, valleys, glaciers). A guessed city slug
 *       mis-resolves to a small Brazilian homonym (e.g. "Lagoa Azul" /
 *       Blue Lagoon -> a tiny town in São Paulo), so we send these to the
 *       indexable homepage hub instead of a wrong forecast.
 *
 *  To extend: verify a slug at https://brasiltempo.com.br/cidade/{slug} and
 *  add the Country Pick gem identifier -> correct slug to CITY_SLUG_OVERRIDE,
 *  or add the identifier to HUB_ONLY if no sensible city forecast exists. */

const BASE = "https://brasiltempo.com.br";
const UTM = "?utm_source=countrypick&utm_medium=referral";

/** Non-ASCII letters that NFKD does not decompose to ASCII. */
const CHAR_MAP: Record<string, string> = {
  ø: "o", æ: "ae", å: "a", œ: "oe", ß: "ss", ð: "d", þ: "th", ł: "l", đ: "d",
};

/** Slugify a Portuguese place name to BrasilTempo's /cidade/{slug} form. */
export function slugify(name: string): string {
  let s = name.toLowerCase();
  for (const [k, v] of Object.entries(CHAR_MAP)) s = s.split(k).join(v);
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); // strip accents
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s;
}

/** Country Pick gem identifier -> verified BrasilTempo slug (exonym fixes). */
const CITY_SLUG_OVERRIDE: Record<string, string> = {
  "new-york": "nova-iorque", // DB name "Nova York" mis-resolves; verified.
};

/** Gem identifiers that are natural sites / regions, not settlements.
 *  A guessed city slug would mis-resolve, so route these to the homepage hub. */
const HUB_ONLY = new Set<string>([
  "amazonas",
  "arenal-volcano",
  "blue-lagoon",
  "cape-winelands",
  "chobe-national-park",
  "iguazu-falls",
  "koror-island",
  "kruger-national-park",
  "lahemaa-national-park",
  "lake-balaton",
  "lake-bled",
  "langjokull-glacier",
  "lofoten-islands",
  "loire-valley",
  "meteora-monasteries",
  "monteverde-cloud-forest",
  "plitvice-lakes",
  "rincon-de-la-vieja",
  "salzkammergut",
  "sardinia",
  "tortuguero",
  "uluru-kata",
  "wachau",
  "yucatan",
  "lagos", // Lagos, Portugal — slug "lagos" resolves to Lagos, Nigeria.
]);

export type TempoLink = { url: string; level: "city" | "hub" };

/** Weather link for a Country Pick city page, or null if not relevant (pt only). */
export function tempoForCity(
  lang: string,
  cityIdentifier: string,
  cityName: string,
): TempoLink | null {
  if (lang !== "pt") return null;
  if (HUB_ONLY.has(cityIdentifier)) return { url: BASE + "/" + UTM, level: "hub" };
  const slug = CITY_SLUG_OVERRIDE[cityIdentifier] ?? slugify(cityName);
  if (!slug) return { url: BASE + "/" + UTM, level: "hub" };
  return { url: `${BASE}/cidade/${slug}${UTM}`, level: "city" };
}

/** Weather link for a Country Pick country page, or null if not relevant (pt only).
 *  Points at the indexable homepage hub — best target for SEO equity. */
export function tempoForCountry(lang: string): TempoLink | null {
  if (lang !== "pt") return null;
  return { url: BASE + "/" + UTM, level: "hub" };
}
