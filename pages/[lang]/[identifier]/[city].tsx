import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import Layout from '@/components/Layout';
import {
  getAllCityPaths,
  getCountryByIdentifier,
  getGemByIdentifier,
  getGemWithThings,
  getGemsByCountry,
  getFooterContinents,
} from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { getCityPrep, getCountryPrep } from '@/lib/prepositions';
import { buildHreflang, cityJsonLd, BASE_URL } from '@/lib/seo';
import type { Lang, Country, Gem, Thing, FooterContinent } from '@/types';

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
  relatedGems: Gem[];
  continents:  FooterContinent[];
  t:           Record<string, string>;
  cityPrep:    string;
  countryPrep: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GMAPS_KEY = process.env.NEXT_PUBLIC_GMAPS_KEY ?? '';

/** Strip HTML tags so additionalInformation JSON can be parsed by initMap(). */
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim();
}

const CityPage: NextPage<Props> = ({
  lang, country, gem, things, hotels: hotelsProp, relatedGems, continents, t, cityPrep, countryPrep,
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
  };

  const hotelsLabel    = `${t['city.text6'] ?? 'Best Places To Stay'}${cityPrep}${gem.name}`;
  const activitiesLabel = `${country.name} ${t['city.text7'] ?? 'Activities'}${cityPrep}${gem.name}`;

  const hasMapData = things.some(th => th.additionalInformation);

  return (
    <Layout lang={lang} t={t} seo={seo} continents={continents}>

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
                    <ins suppressHydrationWarning
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
                                {thing.additionalInformation && (
                                  <input
                                    className="marker-info"
                                    type="hidden"
                                    value={stripHtml(thing.additionalInformation)}
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
                                    src="https://ik.imagekit.io/b