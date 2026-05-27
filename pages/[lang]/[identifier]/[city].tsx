import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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

// Load Agoda hotels client-side only (no SSG needed, always fresh)
const AgodaHotels = dynamic(() => import('@/components/AgodaHotels'), { ssr: false });

interface Props {
  lang: Lang;
  country: Country;
  gem: Gem;
  things: Thing[];
  relatedGems: Gem[];   // other cities in this country → sidebar internal links
  continents: FooterContinent[];
  t: Record<string, string>;
  cityPrep: string;
  countryPrep: string;
}

const CityPage: NextPage<Props> = ({
  lang, country, gem, things, relatedGems, continents, t, cityPrep, countryPrep,
}) => {
  const alpha2Lower   = country.alpha2.toLowerCase();
  const heroImage     = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/${alpha2Lower}.jpg`;
  const gemImage      = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/${gem.identifier}.jpg`;
  const canonicalUrl  = `${BASE_URL}/${lang}/${country.identifier}/${gem.identifier}`;

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

  const hotelsLabel = `${t['city.text6'] ?? 'Best Places To Stay'}${cityPrep}${gem.name}`;
  const activitiesLabel = `${country.name} ${t['city.text7'] ?? 'Activities'}${cityPrep}${gem.name}`;

  return (
    <Layout lang={lang} t={t} seo={seo} continents={continents}>
      {/* Hero header */}
      <section
        className="parallax_window_in"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
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

                  {/* Page title */}
                  <div className="main_title add_bottom_30">
                    <h1 className="page-title">
                      {t['city.text1'] ?? 'Best'}{' '}
                      <strong>{t['city.text2'] ?? 'Things To Do'}</strong>
                      {cityPrep}{gem.name}
                    </h1>
                    <p>{t['city.text4'] ?? 'Find out more about those top places'}{cityPrep}{gem.name}</p>
                    <span><em /></span>
                  </div>

                  {/* City block */}
                  <div className="city-block">
                    {/* City hero image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <p>
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

                    {/* Things to do — timeline list */}
                    {things.length > 0 && (
                      <>
                        <div className="city_map hidden" />
                        <ul className="cbp_tmtimeline js-count-list">
                          {things.map(thing => (
                            <li key={thing.id}>
                              <div className="cbp_tmicon" />
                              <div className="cbp_tmlabel">
                                <h3>{thing.title}</h3>
                                {thing.additionalInformation && (
                                  <input
                                    className="marker-info"
                                    type="hidden"
                                    value={thing.additionalInformation}
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

                    {/* Agoda hotels — loads client-side */}
                    <AgodaHotels
                      cityId={gem.cityId}
                      cityName={gem.name}
                      countryName={country.name}
                      label={hotelsLabel}
                    />

                    {/* GetYourGuide activities link */}
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
            {/* More cities in this country */}
            {relatedGems.length > 0 && (
              <div className="side_box">
                <div className="main_title">
                  <h4>
                    {t['country.text5'] ?? 'Best Things To Do In'}{' '}
                    <strong>{country.name}</strong>
                  </h4>
                  <span><em /></span>
                </div>
                <div className="list_tabs">
                  <ul>
                    {relatedGems.map(g => (
                      <li key={g.id}>
                        <div>
                          <Link href={`/${lang}/${country.identifier}/${g.identifier}`}>
                            <figure>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/tr:w-60,h-60/${g.identifier}.jpg`}
                                alt={g.name}
                                className="img-rounded"
                              />
                            </figure>
                            <h3>{t['country.side11'] ?? 'Best Places'} {countryPrep} {g.name}</h3>
                            <small>{country.name}</small>
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
  const lang             = (params?.lang       as Lang)   ?? 'en';
  const identifier       = (params?.identifier as string) ?? '';
  const cityIdentifier   = (params?.city       as string) ?? '';

  const country = await getCountryByIdentifier(identifier, lang);
  if (!country) return { notFound: true };

  const gem = await getGemByIdentifier(cityIdentifier, identifier, lang);
  if (!gem)  return { notFound: true };

  const [things, allGems, continents] = await Promise.all([
    getGemWithThings(gem.id),
    getGemsByCountry(country.id),
    getFooterContinents(lang),
  ]);

  // Related gems for sidebar — exclude the current city
  const relatedGems = allGems.filter(g => g.id !== gem.id).slice(0, 8);

  const t           = getTranslations(lang);
  const cityPrep    = getCityPrep(gem.name, lang);
  const countryPrep = getCountryPrep(country.alpha2, lang);

  return {
    props: {
      lang,
      country:     JSON.parse(JSON.stringify(country)),
      gem:         JSON.parse(JSON.stringify(gem)),
      things:      JSON.parse(JSON.stringify(things)),
      relatedGems: JSON.parse(JSON.stringify(relatedGems)),
      continents,
      t,
      cityPrep,
      countryPrep,
    },
  };
};
