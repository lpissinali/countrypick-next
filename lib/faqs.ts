export interface FAQ {
  question: string;
  answer: string;
}

/** Replace {placeholder} tokens in a template string. */
function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

/**
 * Build FAQ items for a country page using template strings from translations.
 * Questions that rely on missing data (e.g. no capital) are skipped.
 */
export function buildCountryFaqs(
  t: Record<string, string>,
  country: { name: string; capital: string; currency: string; language: string },
  gemNames: string[],
): FAQ[] {
  const vars: Record<string, string> = {
    country:  country.name,
    capital:  country.capital  ?? '',
    currency: country.currency ?? '',
    language: country.language ?? '',
    gems:     gemNames.slice(0, 5).join(', '),
  };

  const pairs: Array<[string, string, boolean]> = [
    ['country_faq.q1', 'country_faq.a1', true],
    ['country_faq.q2', 'country_faq.a2', !!country.capital],
    ['country_faq.q3', 'country_faq.a3', !!country.currency],
    ['country_faq.q4', 'country_faq.a4', !!country.language],
    ['country_faq.q5', 'country_faq.a5', gemNames.length > 0],
  ];

  return pairs
    .filter(([, , condition]) => condition)
    .flatMap(([qKey, aKey]) => {
      const q = t[qKey];
      const a = t[aKey];
      if (!q || !a) return [];
      return [{ question: fill(q, vars), answer: fill(a, vars) }];
    });
}

/**
 * Build FAQ items for a city page using template strings from translations.
 */
export function buildCityFaqs(
  t: Record<string, string>,
  cityName: string,
  countryName: string,
  thingTitles: string[],
): FAQ[] {
  const vars: Record<string, string> = {
    city:    cityName,
    country: countryName,
    things:  thingTitles.slice(0, 5).join(', '),
  };

  const pairs: Array<[string, string, boolean]> = [
    ['city_faq.q1', 'city_faq.a1', thingTitles.length > 0],
    ['city_faq.q2', 'city_faq.a2', true],
    ['city_faq.q3', 'city_faq.a3', true],
  ];

  return pairs
    .filter(([, , condition]) => condition)
    .flatMap(([qKey, aKey]) => {
      const q = t[qKey];
      const a = t[aKey];
      if (!q || !a) return [];
      return [{ question: fill(q, vars), answer: fill(a, vars) }];
    });
}

/** Build a FAQPage JSON-LD object from an array of FAQs. */
export function faqJsonLd(faqs: FAQ[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
