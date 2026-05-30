import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { query } from '@/lib/db';
import { getAllCountryPaths, getCountryByIdentifier, getGemsWithThingsByCountry, getFooterContinents , getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { getCountryPrep, getCityPrep } from '@/lib/prepositions';
import { buildHreflang, countryJsonLd, BASE_URL } from '@/lib/seo';
import type { Lang, Country, GemWithThings, FooterContinent } from '@/types';

interface Props {
  lang: Lang;
  country: Country;
  gems: GemWithThings[];
  continents: FooterContinent[];
  t: Record<string, string>;
  countryPrep: string;
  activeLangs: { code: string; name: string }[];
}

const CountryPage: NextPage<Props> = ({ lang, country, gems, continents, t, countryPrep, activeLangs }) => {
  const alpha2Lower = country.alpha2.toLowerCase();
  const heroImage   = `https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/${alpha2Lower}.jpg`;
  const canonicalUrl = `${BASE_URL}/${lang}/${country.identifier}`;

  // Build description from gem names (mirrors existing template logic)
  const gemNames    = gems.map(g => g.name).join(', ');
  const description = `${t['country.description'] ?? 'Explore the top tourist destinations'}${countryPrep}${country.name}. ${gemNames ? gemNames + '. ' : ''}${t['country.description2'] ?? 'Discover the best places to visit and must-see attractions for an unforgettable trip.'}`;
  const title       = `${t['country.title'] ?? 'Top Destinations to Visit'}${countryPrep}${country.name} | ${t['country.title2'] ?? 'Best Tourist Attractions'}`;

  const seo = {
    title,
    description,
    canonical: canonicalUrl,
    ogImage: heroImage,
    hreflang: buildHreflang(`/${country.identifier}`),
    jsonLd: countryJsonLd({
      name: country.name,
      identifier: country.identifier,
      lang,
      description,
      alpha2: alpha2Lower,
    }),
  };

  return (
    <Layout activeLangs={activeLangs} lang={lang} t={t} seo={seo} continents={continents}>
      {/* Hero / parallax header */}
      <section
        className="parallax_window_in"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div id="sub_content_in">
          <div id="sub_content_in_left">
            <div className="container">
              <div className="row">
                <div className="col-xs-8">
                  <div className="country">{country.name}</div>
                  <span>
                    <i className="ficon-marker" /> {country.continent?.name}
                  </span>
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
            <li>{country.name}</li>
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
                      {t['country.text1'] ?? 'Best'}{' '}
                      <strong>{t['country.text2'] ?? 'things to do'}</strong>
                      {countryPrep}{country.name}
                    </h1>
                    <p>{t['country.text4'] ?? 'Find out more about those top places'}{countryPrep}{country.name}</p>
                    <span><em /></span>
                  </div>

                  {/* Country facts */}
                  <div className="tab-pane active margin_30">
                    <div className="row">
                      <div className="col-sm-6 col-xs-7">
                        <ul className="facts-list">
                          {country.capital && (
                            <li><strong>{t['country.text6'] ?? 'Capital'}:</strong> {country.capital}</li>
                          )}
                          {country.language && (
                            <li><strong>{t['country.text7'] ?? 'Language(s)'}:</strong> {country.language}</li>
                          )}
                          {country.currency && (
                            <li><strong>{t['country.text8'] ?? 'Currency'}:</strong> {country.currency}</li>
                          )}
                          {country.dialCode > 0 && (
                            <li><strong>{t['country.text9'] ?? 'Dial Code'}:</strong> +{country.dialCode}</li>
                          )}
                        </ul>
                      </div>
                      <div className="col-sm-6 col-xs-5 text-right">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          loading="lazy"
                          src={`/static/img/flags/${alpha2Lower}.png`}
                          alt={country.shortName}
                          className="facts-img"
                        />
                      </div>
                    </div>
                    <hr />

                    {/* Country description (HTML from DB) */}
                    {country.description && (
                      <div
                        className="country-description"
                        dangerouslySetInnerHTML={{ __html: country.description }}
                      />
                    )}
                  </div>

                  {/* AdSense */}
                  <div className="row">
                    <div className="col-xs-12 add_bottom_30">
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
                  </div>

                  {/* Gems / cities grid */}
                  {gems.length > 0 && (
                    <div className="row">
                      {gems.map(gem => (
                        <div key={gem.id} className="col-sm-4 wow fadeIn animated">
                          <div className="img_wrapper">
                            <div className="img_container">
                              <Link href={`/${lang}/${country.identifier}/${gem.identifier}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  loading="lazy"
                                  src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/${gem.identifier}.jpg`}
                                  className="img-responsive"
                                  alt={`${t['country.text5'] ?? 'Best Things To Do In'} ${gem.name}`}
                                />
                                <div className="short_info">
                                  <h3>{t['country.text5'] ?? 'Best Things To Do In'} {gem.name}</h3>
                                  <em>{country.name}</em>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
            {/* Top cities in this country */}
            {gems.length > 0 && (
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
                    {gems.slice(0, 8).map(gem => (
                      <li key={gem.id}>
                        <div>
                          <Link href={`/${lang}/${country.identifier}/${gem.identifier}`}>
                            <figure>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/tr:w-60,h-60/${gem.identifier}.jpg`}
                                alt={gem.name}
                                className="img-rounded"
                              />
                            </figure>
                            <h3>{gem.things.length > 0 ? gem.things.length : ''} {t['country.side11'] ?? 'Best Places'}{getCityPrep(gem.name, lang)}{gem.name}</h3>
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

export default CountryPage;

// ─── Data fetching ─────────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllCountryPaths();
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang       = (params?.lang as Lang)       ?? 'en';
  const identifier = (params?.identifier as string) ?? '';

  const country = await getCountryByIdentifier(identifier, lang);
  if (!country) return { notFound: true };

  const [gems, continents] = await Promise.all([
    getGemsWithThingsByCountry(country.id),
    getFooterContinents(lang),
  ]);

  const t           = getTranslations(lang);
  const countryPrep = getCountryPrep(country.alpha2, lang);
  const activeLangs = await getActiveLangs();

  return {
    props: {
      activeLangs,
      lang,
      country: JSON.parse(JSON.stringify(country)),
      gems:    JSON.parse(JSON.stringify(gems)),
      continents,
      t,
      countryPrep,
    },
  };
};
