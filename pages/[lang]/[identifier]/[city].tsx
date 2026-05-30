import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import Layout from '@/components/Layout';
import {
  getAllCityPaths,
  getCountryByIdentifier,
  getGemByIdentifier,
  getGemWithThings,
  getAllGems,
  getFooterContinents,
  getActiveLangs,
} from '@/lib/queries';
import type { GemWithCountry } from '@/lib/queries';
import { query } from '@/lib/db';
import { getTranslations } from '@/lib/i18n';
import { getCityPrep, getCountryPrep } from '@/lib/prepositions';
import { buildHreflang, cityJsonLd, BASE_URL } from '@/lib/seo';
import { buildCityFaqs, faqJsonLd } from '@/lib/faqs';
import type { FAQ } from '@/lib/faqs';
import type { Lang, Country, Gem, Thing, FooterContinent } from '@/types';

/** Deterministic seeded shuffle — same seed always yields the same order. */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  // Simple hash of the seed string → numeric seed
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (Math.imul(31, s) + seed.charCodeAt(i)) | 0;
  const rng = () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 0x100000000; };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Agoda hotel type ─────────────────────────────────────────────────────────

interface AgodaHotel {
  hotelId:         number;
  hotelName:       string;
  starRating:      number;   // already ×10 (e.g. 45 = 4.5 stars)
  reviewScore:     number;
  reviewScoreText: string;
  dailyRate:       number;
  imageURL:        string;
  landingURL:      string;
  cityName:        string;
  countryName:     string;
}

function reviewLabel(score: number): string {
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  return 'Review Score';
}

/** Fetch Agoda hotels at build time (server-side — HTTP allowed, no mixed-content issue). */
async function fetchAgodaHotels(
  cityId: number,
  cityName: string,
  countryName: string,
): Promise<AgodaHotel[]> {
  if (!cityId) return [];
  const auth = process.env.NEXT_PUBLIC_AGODA_AUTH ?? process.env.AGODA_AUTH ?? '';
  if (!auth) return [];

  const checkIn  = new Date(); checkIn.setMonth(checkIn.getMonth() + 1);
  const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + 2);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const body = JSON.stringify({
    criteria: {
      additional: {
        currency: 'USD', dailyRate: { maximum: 10000, minimum: 1 },
        discountOnly: false, language: 'en-us', maxResult: 3,
        minimumReviewScore: 0, minimumStarRating: 0,
        occupancy: { numberOfAdult: 2, numberOfChildren: 0 },
        sortBy: 'Recommended',
      },
      checkInDate: fmt(checkIn),
      checkOutDate: fmt(checkOut),
      cityId,
    },
  });

  try {
    const res = await fetch('http://affiliateapi7643.agoda.com/affiliateservice/lt_v1', {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) return [];
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) return [];
    const data = await res.json();
    return (data.results ?? []).map((h: Record<string, unknown>) => ({
      hotelId:         h.hotelId as number,
      hotelName:       h.hotelName as string,
      starRating:      Math.round((h.starRating as number) * 10),
      reviewScore:     h.reviewScore as number,
      reviewScoreText: reviewLabel(h.reviewScore as number),
      dailyRate:       Math.round((h.dailyRate as number) * 100) / 100,
      imageURL: ((h.imageURL as string) ?? '')
        .replace('http://pix6.agoda.net', 'https://ik.imagekit.io/bwvxkqzwak0rq')
        .replace('http://q-xx.bstatic.com', 'https://q-xx.bstatic.com')
        .replace('?s=800x600', '/tr:w-252'),
      landingURL:  h.landingURL as string,
      cityName,
      countryName,
    }));
  } catch (_e) {
    return [];
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  lang:        Lang;
  country:     Country;
  gem:         Gem;
  things:      Thing[];
  hotels:      AgodaHotel[] | undefined;
  sidebarGems: GemWithCountry[];
  continents:  FooterContinent[];
  t:           Record<string, string>;
  cityPrep:    string;
  countryPrep: string;
  faqs:        FAQ[];
  activeLangs: { code: string; name: string }[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GMAPS_KEY = process.env.NEXT_PUBLIC_GMAPS_KEY ?? '';

/** Strip HTML tags and return the value only if it is valid JSON (for initMap). */
function extractMarkerJson(s: string): string | null {
  const stripped = s.replace(/<[^>]*>/g, '').trim();
  try {
    JSON.parse(stripped);
    return stripped;
  } catch {
    return null;
  }
}

const CityPage: NextPage<Props> = ({
  lang, country, gem, things, hotels: hotelsProp, sidebarGems, continents, t, cityPrep, countryPrep, faqs, activeLangs,
}) => {
  const hotels = hotelsProp ?? [];
  const alpha2Lower  = country.alpha2.toLowerCase();
  const heroImage    = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/${alpha2Lower}.jpg`;
  const gemImage     = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/${gem.identifier}.jpg`;
  const canonicalUrl = `${BASE_URL}/${lang}/${country.identifier}/${gem.identifier}`;

  const description = `${t['city.description'] ?? 'Looking for the best things to do'}${cityPrep}${gem.name}? ${t['city.description2'] ?? 'Discover top attractions, activities and tours.'}`;
  const title       = `${t['city.title'] ?? 'Best Things To Do'}${cityPrep}${gem.name}, ${country.name} | ${t['city.title2'] ?? 'Travel Guide | Country Pick'}`;

  const seo = {
    title,
    description,
    canonical: canonicalUrl,
    ogImage: heroImage,
    hreflang: buildHreflang(`/${country.identifier}/${gem.identifier}`),
    jsonLd: cityJsonLd({
      cityName:          gem.name,
      countryName:       country.name,
      gemIdentifier:     gem.identifier,
      countryIdentifier: country.identifier,
      lang,
      description,
      imageSlug:         gem.imageSlug,
    }),
    additionalJsonLd: faqs.length > 0 ? [faqJsonLd(faqs)] : undefined,
  };

  const hotelsLabel    = `${t['city.text6'] ?? 'Best Places To Stay'}${cityPrep}${gem.name}`;
  const activitiesLabel = `${country.name} ${t['city.text7'] ?? 'Activities'}${cityPrep}${gem.name}`;

  const hasMapData = things.some(th => th.additionalInformation && extractMarkerJson(th.additionalInformation) !== null);

  return (
    <Layout activeLangs={activeLangs} lang={lang} t={t} seo={seo} continents={continents}>

      {/* Google Maps API — only loaded when there are marker-info items */}
      {hasMapData && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places&callback=initMap&language=${lang}&loading=async`}
          strategy="afterInteractive"
        />
      )}

      {/* Hero header */}
      <section className="parallax_window_in" style={{ backgroundImage: `url(${heroImage})` }}>
        <div id="sub_content_in">
          <div id="sub_content_in_left">
            <div className="container">
              <div className="row">
                <div className="col-xs-8">
                  <div className="country">{gem.name}</div>
                  <span><i className="ficon-marker" /> {country.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div id="position">
        <div className="container">
          <ul>
            <li><Link href={`/${lang}`}>{t['home'] ?? 'Home'}</Link></li>
            <li><Link href={`/${lang}/${country.identifier}`}>{country.name}</Link></li>
            <li>{gem.name}</li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="container margin_60">
        <div className="row">

          {/* ── Left column ── */}
          <div className="col-md-9">
            <div className="box_style-content">
              <div id="gems" className="tab-pane active">
                <div className="box_style_general">

                  <div className="main_title add_bottom_30">
                    <h1 className="page-title">
                      {t['city.text1'] ?? 'Best'}{' '}
                      <strong>{t['city.text2'] ?? 'Things To Do'}</strong>
                      {cityPrep}{gem.name}
                    </h1>
                    <p>{t['city.text4'] ?? 'Find out more about those top places'}{cityPrep}{gem.name}</p>
                    <span><em /></span>
                  </div>

                  <div className="city-block">
                    {/* City hero image */}
                    <p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        loading="lazy"
                        src={gemImage}
                        className="img-responsive"
                        alt={`${t['city.text5'] ?? 'Best things to do'}${cityPrep}${gem.name} - ${country.name}`}
                      />
                    </p>

                    {/* City description */}
                    {gem.description && (
                      <div dangerouslySetInnerHTML={{ __html: gem.description }} />
                    )}

                    {/* AdSense */}
                    <ins
                      className="adsbygoogle"
                      style={{ display: 'block' }}
                      data-ad-client="ca-pub-4831931651277615"
                      data-ad-slot="5242394336"
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                    <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />

                    {/* Things to do — timeline + map */}
                    {things.length > 0 && (
                      <>
                        {/* city_map starts hidden; initMap() reveals it when marker data is present */}
                        <div className="city_map hidden" />
                        <ul className="cbp_tmtimeline js-count-list">
                          {things.map((thing, idx) => (
                            <li key={thing.id}>
                              <div className="cbp_tmicon">{idx + 1}</div>
                              <div className="cbp_tmlabel">
                                <h3>{thing.title}</h3>
                                {thing.additionalInformation && extractMarkerJson(thing.additionalInformation) !== null && (
                                  <input
                                    className="marker-info"
                                    type="hidden"
                                    value={extractMarkerJson(thing.additionalInformation)!}
                                    readOnly
                                  />
                                )}
                                {thing.description && (
                                  <div dangerouslySetInnerHTML={{ __html: thing.description }} />
                                )}
                                {thing.link && (
                                  <p>
                                    <a
                                      className="button button_outline button_small"
                                      href={`${thing.url}?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end`}
                                      target="_blank"
                                      rel="nofollow noreferrer"
                                    >
                                      {thing.link}
                                    </a>
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* FAQ section */}
                    {faqs.length > 0 && (
                      <div className="faq-section add_bottom_30">
                        <div className="main_title add_bottom_30">
                          <h2>{t['country_faq.title'] ?? 'Frequently Asked'} <strong>{t['country_faq.title2'] ?? 'Questions'}</strong></h2>
                          <span><em /></span>
                        </div>
                        {faqs.map((faq, i) => (
                          <details key={i} className="faq-item">
                            <summary>{faq.question}</summary>
                            <p>{faq.answer}</p>
                          </details>
                        ))}
                      </div>
                    )}

                    {/* Agoda hotels — pre-fetched at build time */}
                    {hotels.length > 0 && (
                      <div>
                        <h2 className="main_title">{hotelsLabel}</h2>
                        <div className="hotels-list">
                          {hotels.map(h => (
                            <div key={h.hotelId} className="hotel-item">
                              <a href={h.landingURL} target="_blank" rel="nofollow noreferrer">
                                <div className="background-c">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img loading="lazy" src={h.imageURL} height={168} width={252}
                                    alt={`${h.hotelName} - ${h.cityName}`} />
                                </div>
                                <div className="content-c">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img loading="lazy" className="logo-c"
                                    src="https://ik.imagekit.io/bwvxkqzwak0rq/images/mvc/default/agoda-logo.svg"
                                    alt="Agoda hotels" />
                                  <div className="hotel-name">{h.hotelName}</div>
                                  <div className="rating-location-c">
                                    <i className={`rating-c ficon ficon-star-${h.starRating} orange-yellow`} />
                                    <div className="location-c">
                                      <i className="ficon ficon-pin-star" />
                                      <span className="location">{h.cityName}, {h.countryName}</span>
                                    </div>
                                  </div>
                                  <div className="rating-offer-c">
                                    <span className="rating-text">{h.reviewScoreText}</span>
                                    <span className="rating-value">{h.reviewScore}</span>
                                  </div>
                                  <div className="price-c">${h.dailyRate}</div>
                                </div>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GetYourGuide activities */}
                    <p className="text-center margin_30">
                      <a
                        href={`https://www.getyourguide.com/s/?q=${encodeURIComponent(gem.name)}&partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end`}
                        className="button"
                        target="_blank"
                        rel="nofollow noreferrer"
                      >
                        {activitiesLabel}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AdSense bottom */}
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-4831931651277615"
              data-ad-slot="5242394336"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
          </div>

          {/* ── Sidebar ── */}
          <aside className="col-md-3 theiaStickySidebar" id="sidebar">
            {sidebarGems.length > 0 && (
              <div className="side_box">
                <div className="main_title">
                  <h4>{t['country.side8'] ?? 'Popular'} <strong>{t['country.side9'] ?? 'Destinations'}</strong></h4>
                  <span><em /></span>
                </div>
                <div className="list_tabs">
                  <ul>
                    {sidebarGems.map(g => (
                      <li key={g.id}>
                        <div>
                          <Link href={`/${lang}/${g.countryIdentifier}/${g.identifier}`}>
                            <figure>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-60,h-60/static/img/gems/${g.identifier}.jpg`}
                                alt={g.name}
                                className="img-rounded"
                              />
                            </figure>
                            <h3>{t['country.side11'] ?? 'Best Places'}{getCityPrep(g.name, lang)}{g.name}</h3>
                            <small>{g.countryName}</small>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* AdSense sidebar */}
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-4831931651277615"
              data-ad-slot="5242394336"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default CityPage;

// ─── Data fetching ─────────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllCityPaths();
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang           = (params?.lang       as Lang)   ?? 'en';
  const identifier     = (params?.identifier as string) ?? '';
  const cityIdentifier = (params?.city       as string) ?? '';

  const country = await getCountryByIdentifier(identifier, lang);
  if (!country) return { notFound: true };

  const gem = await getGemByIdentifier(cityIdentifier, identifier, lang);
  if (!gem)  return { notFound: true };

  const [things, allGems, continents, hotels] = await Promise.all([
    getGemWithThings(gem.id),
    getAllGems(),
    getFooterContinents(lang),
    fetchAgodaHotels(gem.cityId, gem.name, country.name),
  ]);

  // Exclude the current gem, then pick 8 deterministically using the gem identifier as seed.
  // Each city page gets a unique but stable set — good for SEO (no duplicate sidebars).
  const sidebarGems = seededShuffle(
    allGems.filter(g => g.id !== gem.id),
    gem.identifier,
  ).slice(0, 8);

  const t           = getTranslations(lang);
  const cityPrep    = getCityPrep(gem.name, lang);
  const countryPrep = getCountryPrep(country.alpha2, lang);
  const faqs        = buildCityFaqs(t, gem.name, country.name, things.map(th => th.title));

  return {
    props: {
      lang,
      country:     JSON.parse(JSON.stringify(country)),
      gem:         JSON.parse(JSON.stringify(gem)),
      activeLangs: await getActiveLangs(),
      things:      JSON.parse(JSON.stringify(things)),
      hotels,
      sidebarGems: JSON.parse(JSON.stringify(sidebarGems)),
      continents,
      t,
      cityPrep,
      countryPrep,
      faqs,
    },
  };
};
