/**
 * SEO helpers — build canonical URLs, hreflang sets, and JSON-LD objects.
 */
import type { Lang, HreflangItem, PageSEO } from '@/types';

export const BASE_URL = 'https://www.countrypick.com';

/**
 * Build hreflang entries from the active languages fetched at build time.
 * Pass activeLangs from getStaticProps so disabled languages are excluded.
 */
export function buildHreflang(
  path: string,
  activeLangs?: { code: string }[],
): HreflangItem[] {
  const langs = activeLangs?.map(l => l.code) ?? ['en', 'pt', 'es'];
  return [
    { hreflang: 'x-default', href: `${BASE_URL}/en${path}` },
    ...langs.map(lang => ({ hreflang: lang, href: `${BASE_URL}/${lang}${path}` })),
  ];
}

export function ogLocale(lang: Lang): string {
  const map: Record<Lang, string> = {
    en: 'en_US',
    pt: 'pt_BR',
    es: 'es_ES',
    ru: 'ru_RU',
  };
  return map[lang];
}

// ─── JSON-LD builders ──────────────────────────────────────────────────────────

export const ORG_LD = {
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Country Pick',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: 'https://ik.imagekit.io/bwvxkqzwak0rq/static/img/logo.png',
    width: 512,
    height: 512,
  },
  sameAs: ['https://www.facebook.com/countrypick/', 'https://x.com/countrypick'],
};

export const WEBSITE_LD = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Country Pick',
  publisher: { '@id': `${BASE_URL}/#organization` },
};

/**
 * Generic WebPage JSON-LD for category / static pages.
 * Includes BreadcrumbList so every page gets the rich result.
 */
export function pageJsonLd(opts: {
  url: string;
  name: string;
  description: string;
  lang: Lang;
  breadcrumbs: { name: string; item: string }[];
}) {
  const { url, name, description, lang, breadcrumbs } = opts;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      WEBSITE_LD,
      ORG_LD,
      {
        '@type': 'WebPage',
        '@id': `${url}/#webpage`,
        url,
        name,
        description,
        inLanguage: lang,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      },
    ],
  };
}

export function countryJsonLd(opts: {
  name: string;
  identifier: string;
  lang: Lang;
  description: string;
  alpha2: string;
  homeLabel?: string;
}) {
  const { name, identifier, lang, description, alpha2, homeLabel = 'Home' } = opts;
  const url = `${BASE_URL}/${lang}/${identifier}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      WEBSITE_LD,
      ORG_LD,
      {
        '@type': 'TouristDestination',
        '@id': `${url}/#destination`,
        name,
        url,
        description,
        image: {
          '@type': 'ImageObject',
          url: `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/${alpha2.toLowerCase()}.jpg`,
          width: 1305,
          height: 652,
        },
        touristType: [
          { '@type': 'Audience', audienceType: 'Cultural tourists' },
          { '@type': 'Audience', audienceType: 'Adventure travelers' },
          { '@type': 'Audience', audienceType: 'Nature enthusiasts' },
        ],
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeLabel, item: `${BASE_URL}/${lang}` },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
      },
    ],
  };
}

export function cityJsonLd(opts: {
  cityName: string;
  countryName: string;
  gemIdentifier: string;
  countryIdentifier: string;
  lang: Lang;
  description: string;
  imageSlug: string;
  homeLabel?: string;
}) {
  const { cityName, countryName, gemIdentifier, countryIdentifier, lang, description, imageSlug, homeLabel = 'Home' } = opts;
  const countryUrl = `${BASE_URL}/${lang}/${countryIdentifier}`;
  const cityUrl    = `${countryUrl}/${gemIdentifier}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      WEBSITE_LD,
      ORG_LD,
      {
        '@type': 'TouristAttraction',
        '@id': `${cityUrl}/#attraction`,
        name: cityName,
        url: cityUrl,
        description,
        image: {
          '@type': 'ImageObject',
          url: `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/${imageSlug}.jpg`,
          width: 1200,
          height: 630,
        },
        containedInPlace: { '@type': 'Country', name: countryName, url: countryUrl },
        isPartOf: { '@id': `${BASE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: homeLabel,   item: `${BASE_URL}/${lang}` },
          { '@type': 'ListItem', position: 2, name: countryName, item: countryUrl },
          { '@type': 'ListItem', position: 3, name: cityName,    item: cityUrl },
        ],
      },
    ],
  };
}
