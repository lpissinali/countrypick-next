/** Cross-links from Country Pick to our sister site AchaBrasil
 *  (achabrasil.com.br), a Brazilian flight-search aggregator. These links are
 *  only relevant on the Portuguese (pt) locale. Pure data - safe anywhere.
 *  UTM tags let AchaBrasil attribute the referral even when rel=noreferrer. */

const ACHA_BASE = "https://achabrasil.com.br";
const UTM = "?utm_source=countrypick&utm_medium=referral";

/** Country Pick city identifier -> AchaBrasil destination IATA (lowercase). */
const CITY_TO_IATA: Record<string, string> = {
  "rio-de-janeiro": "gig",
  brasilia: "bsb",
  fortaleza: "for",
  amazonas: "mao",
  "iguazu-falls": "igu",
  "buenos-aires": "eze",
  santiago: "scl",
  lima: "lim",
  montevideo: "mvd",
  asuncion: "asu",
  bogota: "bog",
  "panama-city": "pty",
  miami: "mia",
  "new-york": "jfk",
  lisbon: "lis",
  madrid: "mad",
  paris: "cdg",
  london: "lhr",
  rome: "fco",
};

/** Country Pick country identifier -> AchaBrasil gateway destination IATA. */
const COUNTRY_TO_IATA: Record<string, string> = {
  argentina: "eze",
  chile: "scl",
  peru: "lim",
  uruguay: "mvd",
  paraguay: "asu",
  colombia: "bog",
  panama: "pty",
  mexico: "cun",
  "united-states-of-america": "mia",
  portugal: "lis",
  spain: "mad",
  france: "cdg",
  "united-kingdom": "lhr",
  italy: "fco",
};

export type AchaLink = { url: string; level: "city" | "country" | "hub" };

/** Flights link for a Country Pick city page, or null if not relevant. */
export function achaForCity(
  lang: string,
  countryIdentifier: string,
  cityIdentifier: string,
): AchaLink | null {
  if (lang !== "pt") return null;
  const cityIata = CITY_TO_IATA[cityIdentifier];
  if (cityIata) return { url: ACHA_BASE + "/destinos/" + cityIata + UTM, level: "city" };
  const ctryIata = COUNTRY_TO_IATA[countryIdentifier];
  if (ctryIata) return { url: ACHA_BASE + "/destinos/" + ctryIata + UTM, level: "country" };
  if (countryIdentifier === "brazil") return { url: ACHA_BASE + "/destinos" + UTM, level: "hub" };
  return null;
}

/** Flights link for a Country Pick country page, or null if not relevant. */
export function achaForCountry(lang: string, countryIdentifier: string): AchaLink | null {
  if (lang !== "pt") return null;
  if (countryIdentifier === "brazil") return { url: ACHA_BASE + "/destinos" + UTM, level: "hub" };
  const iata = COUNTRY_TO_IATA[countryIdentifier];
  if (iata) return { url: ACHA_BASE + "/destinos/" + iata + UTM, level: "country" };
  return null;
}
