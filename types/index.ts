export type Lang = 'en' | 'pt' | 'es' | 'ru';
export const LANGS: Lang[] = ['en', 'pt', 'es', 'ru'];

export interface Continent {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
  shortName: string;
  identifier: string;
  alpha2: string;
  continent: Continent;
  dialCode: number;
  description: string;
  capital: string;
  currency: string;
  language: string;
  languageName: string;
  iata: string;
}

export interface Gem {
  id: number;
  identifier: string;
  name: string;
  description: string;
  cityId: number;
  // derived
  imageSlug: string; // slug used for ImageKit paths
}

export interface Thing {
  id: number;
  title: string;
  description: string;
  url: string;
  link: string;
  additionalInformation: string;
}

export interface GemWithThings extends Gem {
  things: Thing[];
}

export interface FooterContinent {
  name: string;
  countries: { name: string; identifier: string }[];
}

export interface HreflangItem {
  hreflang: string;
  href: string;
}

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  hreflang: HreflangItem[];
  jsonLd?: object;
}
