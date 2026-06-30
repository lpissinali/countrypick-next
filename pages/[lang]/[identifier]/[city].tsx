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
  getAllGemCoords,
  getFooterContinents,
  getActiveLangs,
} from '@/lib/queries';
import type { GemWithCountry, GemCoord, NearbyGem } from '@/lib/queries';

/** Haversine distance in km between two lat/lng points. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
import { query } from '@/lib/db';
import { getTranslations } from '@/lib/i18n';
import { getCityPrep, getCountryPrep } from '@/lib/prepositions';
import { buildHreflang, cityJsonLd, BASE_URL } from '@/lib/seo';
import { buildCityFaqs, faqJsonLd } from '@/lib/faqs';
import type { FAQ } from '@/lib/faqs';
import type { Lang, Country, Gem, Thing, FooterContinent } from '@/types';
import { sanitizeHtml } from '@/lib/sanitize';
import AdSense from '@/components/AdSense';
import GemImage from '@/components/GemImage';
import { achaForCity } from '@/lib/achabrasil';
import { tempoForCity } from '@/lib/brasiltempo';

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
  const auth = process.env.AGODA_AUTH ?? '';
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
        .replace(/^http:\/\/pix\d+\.agoda\.net/, 'https://ik.imagekit.io/bwvxkqzwak0rq')
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
  nearbyGems:  NearbyGem[];
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
  lang, country, gem, things, hotels: hotelsProp, sidebarGems, continents, t, cityPrep, countryPrep, faqs, nearbyGems, activeLangs,
}) => {
  const hotels = hotelsProp ?? [];
  const acha = achaForCity(lang, country.identifier, gem.identifier);
  const tempo = tempoForCity(lang, gem.identifier, gem.name);
  const alpha2Lower  = country.alpha2.toLowerCase();
  const heroImage    = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/${alpha2Lower}.jpg?v=2`;
  const gemImage     = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/${gem.identifier}.jpg?v=2`;
  const canonicalUrl = `${BASE_URL}/${lang}/${country.identifier}/${gem.identifier}`;

  const description = `${t['city.description'] ?? 'Looking for the best things to do'}${cityPrep}${gem.name}? ${t['city.description2'] ?? 'Discover top attractions, activities and tours.'}`;
  const title       = `${t['city.title'] ?? 'Best Things To Do'}${cityPrep}${gem.name}, ${country.name} | ${t['city.title2'] ?? 'Travel Guide | Country Pick'}`;

  const seo = {
    title,
    description,
    canonical: canonicalUrl,
    ogImage: heroImage,
    ogImageAlt: `${t['city.text1'] ?? 'Best things to do'} ${gem.name}, ${country.name}`,
    ogType: 'article' as const,
    hreflang: buildHreflang(`/${country.identifier}/${gem.identifier}`, activeLangs),
    jsonLd: cityJsonLd({
      cityName:          gem.name,
      countryName:       country.name,
      gemIdentifier:     gem.identifier,
      countryIdentifier: country.identifier,
      lang,
      description,
      imageSlug:         gem.imageSlug,
      homeLabel:         t['home'] ?? 'Home',
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
                      <GemImage
                        src={gemImage}
                        fallback={heroImage}
                        className="img-responsive"
                        alt={`${t['city.text5'] ?? 'Best things to do'}${cityPrep}${gem.name} - ${country.name}`}
                      />
                    </p>

                    {/* City description */}
                    {gem.description && (
                      <div dangerouslySetInnerHTML={{ __html: gem.description }} />
                    )}

                    {/* Voos para o destino — AchaBrasil (site irmão) */}
                    {acha && (
                      <div className="add_bottom_30" style={{ textAlign: 'center', padding: '22px', border: '1px solid #ededed', borderRadius: '10px', margin: '30px 0' }}>
                        <p style={{ marginBottom: '12px', fontWeight: 600 }}>
                          {acha.level === 'city'
                            ? `Planejando a viagem? Encontre voos para ${gem.name}`
                            : acha.level === 'country'
                              ? `Planejando a viagem? Encontre voos para ${country.name}`
                              : 'Planejando a viagem? Ache voos baratos pelo Brasil'}
                        </p>
                        <a href={acha.url} target="_blank" rel="noopener noreferrer" className="button">
                          {acha.level === 'city'
                            ? `Passagens aéreas para ${gem.name}`
                            : acha.level === 'country'
                              ? `Voos para ${country.name}`
                              : 'Ver voos no AchaBrasil'}
                        </a>
                        <p style={{ marginTop: '10px', fontSize: '13px', color: '#999' }}>
                          Compare GOL, LATAM e Azul no AchaBrasil
                        </p>
                      </div>
                    )}

                    {/* Previsão do tempo — BrasilTempo (site irmão) */}
                    {tempo && (
                      <div className="add_bottom_30" style={{ textAlign: 'center', padding: '22px', border: '1px solid #ededed', borderRadius: '10px', margin: '30px 0' }}>
                        <p style={{ marginBottom: '12px', fontWeight: 600 }}>
                          {tempo.level === 'city'
                            ? `Vai para ${gem.name}? Veja como está o tempo`
                            : 'Confira a previsão do tempo antes de viajar'}
                        </p>
                        <a href={tempo.url} target="_blank" rel="noopener noreferrer" className="button">
                          {tempo.level === 'city'
                            ? `Previsão do tempo em ${gem.name}`
                            : 'Ver previsão do tempo no BrasilTempo'}
                        </a>
                        <p style={{ marginTop: '10px', fontSize: '13px', color: '#999' }}>
                          Previsão de 7 dias no BrasilTempo
                        </p>
                      </div>
                    )}

                    {/* AdSense */}
                    <AdSense slot="5242394336" />

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

                    {/* Ad: after FAQs */}
                    <AdSense slot="2651930679" />

                    {/* Nearby destinations */}
                    {nearbyGems.length > 0 && (() => {
                      const minDist = nearbyGems[0]?.distKm ?? null;
                      const allFar  = minDist != null && minDist > 500;
                      return (
                      <div className="nearby-section add_bottom_30">
                        <div className="main_title add_bottom_30">
                          <h2>
                            {allFar
                              ? (t['city.nearby_title_far'] ?? 'Closest Destinations From')
                              : (t['city.nearby_title']     ?? 'Things To Do Near')}
                            {' '}<strong>{gem.name}</strong>
                          </h2>
                          {allFar && (
                            <p className="nearby-far-note">
                              {t['city.nearby_far_note'] ?? `${gem.name} is one of the world's more remote destinations. These are the closest places worth exploring.`}
                            </p>
                          )}
                          <span><em /></span>
                        </div>
                        <div className="nearby-grid">
                          {nearbyGems.map(g => {
                            const dist = g.distKm;
                            const tripKey = dist == null     ? null
                              : dist < 80                   ? 'city.nearby_day'
                              : dist < 250                  ? 'city.nearby_weekend'
                              : dist < 500                  ? 'city.nearby_fewdays'
                              :                               'city.nearby_extension';
                            const tripDefault = dist == null     ? ''
                              : dist < 80                   ? 'Perfect for a day trip'
                              : dist < 250                  ? 'Great for a weekend trip'
                              : dist < 500                  ? 'Worth a few days'
                              :                               'A great extension to your trip';
                            return (
                              <Link
                                key={g.id}
                                href={`/${lang}/${g.countryIdentifier}/${g.identifier}`}
                                className="nearby-card"
                              >
                                <GemImage
                                  src={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-300,h-200/static/img/gems/${g.identifier}.jpg?v=2`}
                                  fallback={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-300,h-200/static/img/gallery/${g.countryAlpha2.toLowerCase()}.jpg?v=2`}
                                  alt={g.name}
                                  loading="lazy"
                                />
                                <div className="nearby-card-body">
                                  <span className="nearby-card-name">{g.name}</span>
                                  <span className="nearby-card-country">{g.countryName}</span>
                                  {dist != null && (
                                    <span className="nearby-card-dist">
                                      {dist.toLocaleString()} km
                                    </span>
                                  )}
                                  {tripKey && (
                                    <span className="nearby-card-trip">
                                      {t[tripKey] ?? tripDefault}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })()}

                    {/* Ad: after nearby destinations */}
                    <AdSense slot="2651930679" />

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
                                    src="https://ik.imagekit.io/bwvxkqzwak0rq/images/mvc/default/agoda-logo.svg?v=2"
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
            <AdSense slot="5242394336" />
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
                              <GemImage
                                src={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-60,h-60/static/img/gems/${g.identifier}.jpg?v=2`}
                                fallback={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-60,h-60/static/img/gallery/${g.countryAlpha2.toLowerCase()}.jpg?v=2`}
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
            <AdSense slot="5242394336" />
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

  const [things, allGems, gemCoords, continents, hotels] = await Promise.all([
    getGemWithThings(gem.id),
    getAllGems(),
    getAllGemCoords(),
    getFooterContinents(lang),
    fetchAgodaHotels(gem.cityId, gem.name, country.name),
  ]);

  const sidebarGems = seededShuffle(
    allGems.filter(g => g.identifier !== gem.identifier),
    gem.identifier,
  ).slice(0, 8);

  const t           = getTranslations(lang);
  const cityPrep    = getCityPrep(gem.name, lang);
  const countryPrep = getCountryPrep(country.alpha2, lang);
  const faqs        = buildCityFaqs(t, gem.name, country.name, things.map(th => th.title));

  const currentCoord = gemCoords.find(g => g.identifier === gem.identifier);
  let nearbyGems: NearbyGem[];
  if (currentCoord?.lat != null && currentCoord?.lng != null) {
    nearbyGems = gemCoords
      .filter(g => g.identifier !== gem.identifier && g.lat != null && g.lng != null)
      .map(g => ({
        ...g,
        distKm: Math.round(haversineKm(currentCoord.lat!, currentCoord.lng!, g.lat!, g.lng!)),
      }))
      .sort((a, b) => a.distKm! - b.distKm!)
      .slice(0, 4);
  } else {
    nearbyGems = gemCoords
      .filter(g => g.identifier !== gem.identifier && g.countryIdentifier === country.identifier)
      .slice(0, 4)
      .map(g => ({ ...g, distKm: null }));
  }

  return {
    props: {
      lang,
      country:     JSON.parse(JSON.stringify(country)),
      gem:         JSON.parse(JSON.stringify({ ...gem, description: sanitizeHtml(gem.description) })),
      activeLangs: await getActiveLangs(),
      things:      JSON.parse(JSON.stringify(things.map(th => ({ ...th, description: sanitizeHtml(th.description) })))),
      hotels,
      sidebarGems: JSON.parse(JSON.stringify(sidebarGems)),
      nearbyGems:  JSON.parse(JSON.stringify(nearbyGems)),
      continents,
      t,
      cityPrep,
      countryPrep,
      faqs,
    },
  };
};
