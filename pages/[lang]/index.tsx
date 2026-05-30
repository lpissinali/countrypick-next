import { useEffect, useRef } from 'react';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getFooterContinents, getAllCountries } from '@/lib/queries';
import { getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL, WEBSITE_LD, ORG_LD } from '@/lib/seo';
import { type Lang, type FooterContinent } from '@/types';
import CountryQuiz from '@/components/CountryQuiz';
import { COUNTRY_TAGS } from '@/lib/quiz-data';
import type { QuizCountry } from '@/lib/quiz-data';
import { getSeasonInfo } from '@/lib/season-data';

interface Props {
  lang: Lang;
  t: Record<string, string>;
  continents: FooterContinent[];
  activeLangs: { code: string; name: string }[];
  quizCountries: QuizCountry[];
}

type FeaturedItem = { img: string; alt: string; href: string; label: string; sub: string; ribbon?: string };
const FEATURED_ROW1_BIG:    FeaturedItem =   { img: 'us', alt: 'United States Tours',  href: 'united-states-of-america', label: 'United States', sub: 'Washington' };
const FEATURED_ROW1_STACK:  FeaturedItem[] = [
  { img: 'it', alt: 'Italy Tours',          href: 'italy',          label: 'Italy',   sub: 'Rome'   },
  { img: 'gb', alt: 'United Kingdom Tours', href: 'united-kingdom', label: 'England', sub: 'London' },
];
const FEATURED_ROW2: FeaturedItem[] = [
  { img: 'jp', alt: 'Japan Tours',  href: 'japan',  label: 'Japan',  sub: 'Tokyo',         ribbon: 'top_rated' },
  { img: 'br', alt: 'Brazil Tours', href: 'brazil', label: 'Brazil', sub: 'Rio de Janeiro', ribbon: 'top_rated' },
  { img: 'ca', alt: 'Canada Tours', href: 'canada', label: 'Canada', sub: 'Ottawa',         ribbon: 'top_rated' },
];

const HomePage: NextPage<Props> = ({ lang, t, continents, activeLangs, quizCountries }) => {
  const canonical = `${BASE_URL}/${lang}`;
  const title       = t['home.title']       ?? 'Visited Countries Map Generator | Travel Tips & Things to Do | Country Pick';
  const description = t['home.description'] ?? 'Create your own visited countries map for free with Country Pick!';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      WEBSITE_LD,
      ORG_LD,
      {
        '@type': 'WebPage',
        '@id': `${canonical}/#webpage`,
        url: canonical,
        name: title,
        description,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonical },
        ],
      },
    ],
  };

  const seo = {
    title,
    description,
    canonical,
    ogImage: 'https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-1200,h-630,f-auto/static/img/it.jpg',
    ogImageAlt: title,
    hreflang: buildHreflang(''),
    jsonLd,
  };

  // Map widget i18n strings passed to the inline script
  const mwStrings = {
    visited:         t['visited']           ?? 'Visited',
    bucketList:      t['bucket_list']       ?? 'Bucket List',
    clear:           t['mw_clear']          ?? 'Clear',
    continents:      t['mw_continents']     ?? 'Continents',
    ofTheWorld:      t['mw_of_the_world']   ?? 'Of the world',
    square:          t['mw_square']         ?? 'Square',
    story:           t['mw_story']          ?? 'Story',
    share:           t['mw_share']          ?? 'Share',
    resetMap:        t['mw_reset_map']      ?? 'Reset map',
    travelersAtlas:  t['mw_travelers_atlas']?? "A Traveler's Atlas",
    myWorld:         t['mw_my_world']       ?? 'My world,',
    soFar:           t['mw_so_far']         ?? 'so far.',
    countriesVisited:t['mw_countries_visited'] ?? 'Countries visited',
    onTheWishlist:   t['mw_on_the_wishlist']   ?? 'On the wishlist',
    findCountry:     t['find_country']      ?? 'Find a country',
    downloadMap:     t['download_map']      ?? 'Download Map',
    shareTitle:      t['mw_share_title']    ?? 'Share this map',
    copyLink:        t['mw_copy_link']      ?? 'Copy link',
    shareTwitter:    t['mw_share_twitter']  ?? 'Share on X (Twitter)',
    shareWhatsapp:   t['mw_share_whatsapp'] ?? 'Share on WhatsApp',
    shareTelegram:   t['mw_share_telegram'] ?? 'Share on Telegram',
    emailLink:       t['mw_email_link']     ?? 'Email this link',
    moreOptions:     t['mw_more_options']   ?? 'More options',
    instaNote:       t['mw_insta_note']     ?? 'Instagram or TikTok? Use the Download image button.',
    shareTextEmpty:  t['mw_share_text_empty'] ?? "I'm mapping out where I want to travel — what do you think?",
    shareTextOne:    t['mw_share_text_one']   ?? "I've been to 1 country so far. Here's my travel map — make yours free at countrypick.com",
    shareTextMany:   t['mw_share_text_many']  ?? "I've been to {n} countries so far. Here's my travel map — make yours free at countrypick.com",
    emailSubject:    t['mw_email_subject']  ?? 'My travel map',
    nativeShareTitle:t['mw_native_share_title'] ?? 'My Travel Map',
    copied:          t['mw_copied']         ?? 'Link copied!',
    generating:      t['mw_generating']     ?? 'Generating…',
    error:           t['mw_error']          ?? 'Something went wrong. Please try again.',
    confirmReset:    t['mw_confirm_reset']  ?? 'Clear your map? This cannot be undone.',
    mapError:        t['mw_map_error']      ?? 'Could not load map data. Please refresh.',
    hintVisited:     t['mw_hint_visited']   ?? 'Click to mark as visited',
    hintWishlist:    t['mw_hint_wishlist']  ?? 'Click to add to wishlist',
    hintClear:       t['mw_hint_clear']     ?? 'Click to clear',
    hintRemove:      t['mw_hint_remove']    ?? 'click again to remove',
    visitedLabel:    t['mw_visited_label']  ?? 'Visited',
    wishlistLabel:   t['mw_wishlist_label'] ?? 'Wishlist',
    addLabel:        t['mw_add_label']      ?? '— add',
    countriesVisitedSmall: t['mw_countries_visited_small'] ?? 'countries visited',
  };

  // Guard against double-init within the same mount (React StrictMode / HMR).
  // Using a ref (not a window global) so the flag resets when the component
  // unmounts — allowing the map to reinitialize after a language switch.
  const mapInitRef = useRef(false);

  useEffect(() => {
    if (mapInitRef.current) return;
    mapInitRef.current = true;

    // map-widget.js reads window.MW_I18N for i18n strings
    (window as any).MW_I18N = mwStrings;

    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      // For map-widget.js: always remove the old tag and re-add it so the IIFE
      // re-executes against the freshly-rendered #mw-map container.
      if (src === '/static/js/map-widget.js') {
        document.querySelector(`script[src="${src}"]`)?.remove();
      } else if (document.querySelector(`script[src="${src}"]`)) {
        resolve(); return;
      }
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = () => resolve();
      s.onerror = reject;
      document.body.appendChild(s);
    });

    const leafletReady    = typeof (window as any).L !== 'undefined';
    const html2canvasReady = typeof (window as any).html2canvas !== 'undefined';

    (leafletReady
      ? Promise.resolve()
      : loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'))
      .then(() => html2canvasReady
        ? Promise.resolve()
        : loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'))
      .then(() => loadScript('/static/js/map-widget.js'))
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout activeLangs={activeLangs} lang={lang} t={t} seo={seo} continents={continents}>
      {/* ── Map Widget ── */}
      <div className="map-widget-wrap">
        <div className="mw-hero">
          <h1>{t['home.text1'] ?? 'Create your'} <strong>{t['home.text2'] ?? 'Visited Countries Map'}</strong></h1>
          <p>{t['home.desc'] ?? 'On the customizable map below select the countries that you have visited and wish to visit.'}</p>
        </div>

        <div className="mw-toolbar">
          <div className="mw-mode-switch" role="tablist">
            <button className="active" data-mode="visited">● {t['visited'] ?? 'Visited'}</button>
            <button data-mode="wishlist">● {t['bucket_list'] ?? 'Bucket List'}</button>
            <button data-mode="clear">{t['mw_clear'] ?? 'Clear'}</button>
          </div>
          <div className="mw-search">
            <input type="text" id="mw-search-input" placeholder={`${t['find_country'] ?? 'Find a country'}…`} autoComplete="off" />
            <div className="mw-search-results" id="mw-search-results" />
          </div>
        </div>

        <div className="mw-stats-bar">
          <div className="mw-stat visited">
            <div className="num" id="mw-stat-visited">0</div>
            <div className="label">{t['visited'] ?? 'Visited'}</div>
          </div>
          <div className="mw-stat wishlist">
            <div className="num" id="mw-stat-wishlist">0</div>
            <div className="label">{t['bucket_list'] ?? 'Bucket List'}</div>
          </div>
          <div className="mw-stat">
            <div className="num" id="mw-stat-continents">0</div>
            <div className="label">{t['mw_continents'] ?? 'Continents'}</div>
          </div>
          <div className="mw-stat">
            <div className="num" id="mw-stat-percent">0<span style={{ fontSize: 16 }}>%</span></div>
            <div className="label">{t['mw_of_the_world'] ?? 'Of the world'}</div>
          </div>
        </div>

        <div id="mw-map" />

        <div className="mw-actions">
          <div className="mw-format-switch" role="tablist">
            <button className="active" data-format="square">◼ {t['mw_square'] ?? 'Square'}</button>
            <button data-format="story">▮ {t['mw_story'] ?? 'Story'}</button>
          </div>
          <button className="mw-btn" id="mw-download-btn">↓ {t['download_map'] ?? 'Download Map'}</button>
          <div className="mw-share-wrap">
            <button className="mw-btn ghost" id="mw-share-btn">⌘ {t['mw_share'] ?? 'Share'}</button>
            <div className="mw-share-menu" id="mw-share-menu" role="menu" />
          </div>
          <button className="mw-btn ghost" id="mw-reset-btn">{t['mw_reset_map'] ?? 'Reset map'}</button>
        </div>
      </div>

      {/* Poster templates (off-screen, used by map widget for image export) */}
      <div className="mw-poster square" id="mw-poster-square">
        <div className="corner-tl" /><div className="corner-br" />
        <div className="inner">
          <div>
            <div className="eyebrow">{mwStrings.travelersAtlas}</div>
            <div className="title">{mwStrings.myWorld} <em>{mwStrings.soFar}</em></div>
          </div>
          <div className="map-holder" id="mw-ph-square" />
          <div className="breakdown">
            <div className="cell v"><div className="n" id="mw-ph-sq-v">0</div><div className="l">{mwStrings.countriesVisited}</div></div>
            <div className="cell w"><div className="n" id="mw-ph-sq-w">0</div><div className="l">{mwStrings.onTheWishlist}</div></div>
            <div className="cell"><div className="n" id="mw-ph-sq-c">0</div><div className="l">{mwStrings.continents}</div></div>
          </div>
          <div className="footer">
            <div className="brand-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://ik.imagekit.io/bwvxkqzwak0rq/static/img/logo_2_2x.png" alt="Country Pick" crossOrigin="anonymous" />
              Country <span>Pick</span>
            </div>
            <div className="url">countrypick.com</div>
          </div>
        </div>
      </div>

      {/* ── Countries You Might Like Quiz ── */}
      <CountryQuiz lang={lang} t={t} countries={quizCountries} />

      {/* ── "Discover Unique Tours" section ── */}
      <section className="bg_white margin_60_30">
        <div className="container">
          <div className="main_title">
            <h2>{t['home.text3'] ?? 'Discover Unique'} <strong>{t['home.text4'] ?? 'Guided Tours'}</strong> {t['home.text5'] ?? '& Top Attractions with Country Pick'}</h2>
            <p>{t['home.text6'] ?? 'Looking for unforgettable guided tours and must-see attractions?'}</p>
            <span><em /></span>
          </div>
          <div className="content">
            <div className="row list_tabs">
              {/* Best Things To Do */}
              <div className="col-md-4 col-sm-4">
                <h2>{t['home.text7'] ?? 'Best Things To Do'}</h2>
                <ul>
                  {[
                    { href: 'brazil',       img: 'amazonas',            alt: 'Amazonas',           label: t['home.text8']  ?? 'See Pink Dolphins on the Amazon', sub: t['home.text9']  ?? 'Amazon - Brazil' },
                    { href: 'canada',       img: 'quebec',              alt: 'Quebec',             label: t['home.text10'] ?? 'Visit Quebec City Aquarium',      sub: t['home.text11'] ?? 'Quebec - Canada' },
                    { href: 'south-africa', img: 'kruger-national-park',alt: 'Kruger',             label: t['home.text12'] ?? 'Kruger National Park Safari',      sub: t['home.text13'] ?? 'Kruger - South Africa' },
                  ].map(item => (
                    <li key={item.href}>
                      <div>
                        <Link href={`/${lang}/${item.href}`}>
                          <figure>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/tr:w-60,h-60/${item.img}.jpg`} alt={item.alt} className="img-rounded" />
                          </figure>
                          <h3>{item.label}</h3>
                          <small>{item.sub}</small>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Top Rated Tours */}
              <div className="col-md-4 col-sm-4">
                <h2>{t['home.text14'] ?? 'Top Rated Guided Tours'}</h2>
                <ul>
                  {[
                    { href: 'spain',     img: 'granada',   alt: 'Granada',  label: t['home.text15'] ?? 'Alhambra and Generalife Guided Tour', sub: t['home.text16'] ?? 'Granada - Spain'       },
                    { href: 'iceland',   img: 'reykjavik', alt: 'Reykjavik',label: t['home.text17'] ?? 'Golden Circle Tour',                  sub: t['home.text18'] ?? 'Reykjavik - Iceland'   },
                    { href: 'australia', img: 'uluru-kata',alt: 'Uluru',    label: t['home.text19'] ?? 'Uluru and Kata Tjuta Tour',            sub: t['home.text20'] ?? 'Uluru-Kata - Australia' },
                  ].map(item => (
                    <li key={item.href}>
                      <div>
                        <Link href={`/${lang}/${item.href}`}>
                          <figure>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/tr:w-60,h-60/${item.img}.jpg`} alt={item.alt} className="img-rounded" />
                          </figure>
                          <h3>{item.label}</h3>
                          <small>{item.sub}</small>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Best Worldwide Attractions */}
              <div className="col-md-4 col-sm-4">
                <h2>{t['home.text21'] ?? 'Best Worldwide Attractions'}</h2>
                <ul>
                  {[
                    { href: 'india',                      img: 'agra',         alt: 'Taj Mahal',       label: t['home.text22'] ?? 'Taj Mahal',        sub: t['home.text23'] ?? 'Agra - India'           },
                    { href: 'united-states-of-america',   img: 'page-arizona', alt: 'Antelope Canyon', label: t['home.text24'] ?? 'Antelope Canyon',  sub: t['home.text25'] ?? 'Page - United States'   },
                    { href: 'thailand',                   img: 'phuket',       alt: 'Phuket',          label: t['home.text26'] ?? 'Phuket',           sub: t['home.text27'] ?? 'Phuket - Thailand'      },
                  ].map(item => (
                    <li key={item.href}>
                      <div>
                        <Link href={`/${lang}/${item.href}`}>
                          <figure>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/tr:w-60,h-60/${item.img}.jpg`} alt={item.alt} className="img-rounded" />
                          </figure>
                          <h3>{item.label}</h3>
                          <small>{item.sub}</small>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Destinations ── */}
      <div className="pattern_dots">
        <div className="container margin_60_45">
          <div className="main_title">
            <h2>{t['home.text28'] ?? 'Featured'} <strong>{t['home.text29'] ?? 'Destinations'}</strong> {t['home.text30'] ?? 'for Your Next Adventure'}</h2>
            <p>{t['home.text31'] ?? 'Every traveler has a dream destination.'}</p>
            <span><em /></span>
          </div>

          {/* Row 1: one big card + two stacked in right column */}
          <div className="row">
            <div className="col-md-8">
              <div className="img_wrapper_grid">
                <div className="ribbon"><span>{t['popular'] ?? 'Popular'}</span></div>
                <div className="img_container_grid">
                  <Link href={`/${lang}/${FEATURED_ROW1_BIG.href}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/${FEATURED_ROW1_BIG.img}.jpg`} className="img-responsive" alt={FEATURED_ROW1_BIG.alt} loading="eager" />
                    <div className="short_info_grid">
                      <h3>{t['usa'] ?? FEATURED_ROW1_BIG.label}</h3>
                      <em>{FEATURED_ROW1_BIG.sub}</em>
                      <p>{t['read_more'] ?? 'Read More'}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              {FEATURED_ROW1_STACK.map(f => (
                <div key={f.href} className="img_wrapper_grid">
                  <div className="ribbon"><span>{t['popular'] ?? 'Popular'}</span></div>
                  <div className="img_container_grid">
                    <Link href={`/${lang}/${f.href}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/${f.img}.jpg`} className="img-responsive" alt={f.alt} loading="lazy" />
                      <div className="short_info_grid">
                        <h3>{f.label}</h3>
                        <em>{f.sub}</em>
                        <p>{t['read_more'] ?? 'Read More'}</p>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: three equal cards */}
          <div className="row">
            {FEATURED_ROW2.map(f => (
              <div key={f.href} className="col-md-4">
                <div className="img_wrapper_grid">
                  <div className="ribbon top"><span>{t['top_rated'] ?? 'Top Rated'}</span></div>
                  <div className="img_container_grid">
                    <Link href={`/${lang}/${f.href}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/${f.img}.jpg`} className="img-responsive" alt={f.alt} loading="lazy" />
                      <div className="short_info_grid">
                        <h3>{f.label}</h3>
                        <em>{f.sub}</em>
                        <p>{t['read_more'] ?? 'Read More'}</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Explore the World ── */}
      <section className="bg_blue explore-section">
        <div className="container">
          <div className="main_title">
            <h3>{t['explore'] ?? 'Explore'} <strong>{t['the_world'] ?? 'the World'}</strong></h3>
            <p>{t['explore_subtitle'] ?? 'Discover top attractions, historic cities, natural wonders and adventure destinations.'}</p>
            <span><em /></span>
          </div>
          <div className="row explore-cards">
            {[
              { num: '01', href: `/${lang}/attractions`,              label: t['top_attractions']   ?? 'Top Attractions',    desc: t['explore_attractions_desc'] ?? '', cta: t['cta_attractions']  ?? 'Browse attractions'      },
              { num: '02', href: `/${lang}/best-historical-cities`,   label: t['historical_cities'] ?? 'Historical Cities',  desc: t['explore_historical_desc']  ?? '', cta: t['cta_historical']   ?? 'Browse historical cities' },
              { num: '03', href: `/${lang}/top-natural-places`,       label: t['natural_places']    ?? 'Natural Places',     desc: t['explore_natural_desc']     ?? '', cta: t['cta_natural']      ?? 'Discover natural places'  },
              { num: '04', href: `/${lang}/adventurous-things-to-do`, label: t['adventure_travel']  ?? 'Adventure Travel',   desc: t['explore_adventure_desc']   ?? '', cta: t['cta_adventure']    ?? 'Find adventures'          },
            ].map(cat => (
              <div key={cat.href} className="col-md-3 col-sm-6">
                <Link href={cat.href} className="explore-card">
                  <div className="explore-card__num">{cat.num}</div>
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                  <span className="explore-card__cta">{cat.cta} &rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await getActiveLangs()).map(l => ({ params: { lang: l.code } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const [continents, allCountries] = await Promise.all([
    getFooterContinents(lang),
    getAllCountries(lang),
  ]);
  const t = getTranslations(lang);
  const activeLangs = await getActiveLangs();

  // Build the quiz country list: only countries that have both tags and season data
  const quizCountries: QuizCountry[] = allCountries
    .filter(c => COUNTRY_TAGS[c.alpha2])
    .map(c => {
      const season = getSeasonInfo(c.alpha2);
      return {
        identifier: c.identifier,
        alpha2:     c.alpha2,
        name:       c.name,
        tags:       COUNTRY_TAGS[c.alpha2] ?? [],
        bestMonths: season?.bestMonths ?? [],
      };
    });

  return { props: { activeLangs, lang, t, continents, quizCountries } };
};
