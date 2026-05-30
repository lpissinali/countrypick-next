import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { query } from '@/lib/db';
import { getAllCountryPaths, getCountryByIdentifier, getGemsWithThingsByCountry, getAllGems, getFooterContinents, getActiveLangs } from '@/lib/queries';
import type { GemWithCountry } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { getCountryPrep, getCityPrep } from '@/lib/prepositions';
import { buildHreflang, countryJsonLd, BASE_URL } from '@/lib/seo';
import { buildCountryFaqs, faqJsonLd } from '@/lib/faqs';
import type { FAQ } from '@/lib/faqs';
import { getSeasonInfo } from '@/lib/season-data';
import type { SeasonInfo } from '@/lib/season-data';
import type { Lang, Country, GemWithThings, FooterContinent } from '@/types';

function seededShuffle<T>(arr: T[], seed: string): T[] {
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

interface Props {
  lang: Lang;
  country: Country;
  gems: GemWithThings[];
  sidebarGems: GemWithCountry[];
  continents: FooterContinent[];
  t: Record<string, string>;
  countryPrep: string;
  faqs: FAQ[];
  season: SeasonInfo | null;
  activeLangs: { code: string; name: string }[];
}

const MONTH_KEYS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_KEYS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTH_KEYS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTH_KEYS_RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

function monthLabels(lang: string): string[] {
  if (lang === 'pt') return MONTH_KEYS_PT;
  if (lang === 'es') return MONTH_KEYS_ES;
  if (lang === 'ru') return MONTH_KEYS_RU;
  return MONTH_KEYS_EN;
}

const CountryPage: NextPage<Props> = ({ lang, country, gems, sidebarGems, continents, t, countryPrep, faqs, season, activeLangs }) => {
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
    additionalJsonLd: faqs.length > 0 ? [faqJsonLd(faqs)] : undefined,
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
                                  alt={`${t['country.text5'] ?? 'Best Things To Do In'}${getCityPrep(gem.name, lang)}${gem.name}`}
                                />
                                <div className="short_info">
                                  <h3>{t['country.text5'] ?? 'Best Things To Do In'}{getCityPrep(gem.name, lang)}{gem.name}</h3>
                                  <em>{country.name}</em>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Best time to visit */}
                  {season && (
                    <div className="season-section add_bottom_30">
                      <div className="main_title add_bottom_30">
                        <h2>{t['country.season_title'] ?? 'Best Time to'} <strong>{t['country.season_title2'] ?? 'Visit'} {country.name}</strong></h2>
                        <span><em /></span>
                      </div>
                      <p className="season-desc">
                        {lang === 'pt' ? season.desc.pt : lang === 'es' ? season.desc.es : season.desc.en}
                      </p>
                      <div className="season-strip">
                        {monthLabels(lang).map((label, i) => {
                          const m = i + 1;
                          const isBest = season.bestMonths.includes(m);
                          const isPeak = season.peakMonths.includes(m);
                          return (
                            <div
                              key={m}
                              className={`season-month${isBest ? ' best' : isPeak ? ' peak' : ''}`}
                            >
                              <span>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="season-legend">
                        <span className="legend-best" />
                        <span>{t['country.season_best'] ?? 'Best time'}</span>
                        <span className="legend-peak" />
                        <span>{t['country.season_peak'] ?? 'Peak season'}</span>
                        <span className="legend-off" />
                        <span>{t['country.season_off'] ?? 'Off season'}</span>
                      </div>
                    </div>
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

  const [gems, allGems, continents] = await Promise.all([
    getGemsWithThingsByCountry(country.id),
    getAllGems(),
    getFooterContinents(lang),
  ]);

  const sidebarGems = seededShuffle(
    allGems.filter(g => g.countryIdentifier !== country.identifier),
    country.identifier,
  ).slice(0, 8);

  const t           = getTranslations(lang);
  const countryPrep = getCountryPrep(country.alpha2, lang);
  const faqs        = buildCountryFaqs(t, country, gems.map(g => g.name));
  const season      = getSeasonInfo(country.alpha2);
  const activeLangs = await getActiveLangs();

  return {
    props: {
      activeLangs,
      lang,
      country:     JSON.parse(JSON.stringify(country)),
      gems:        JSON.parse(JSON.stringify(gems)),
      sidebarGems: JSON.parse(JSON.stringify(sidebarGems)),
      continents,
      t,
      countryPrep,
      faqs,
      season,
    },
  };
};
