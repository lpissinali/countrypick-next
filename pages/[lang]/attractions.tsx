import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

/** Static item data — labels/subtitles/descs come from i18n at runtime */
const ATTRACTION_ITEMS = [
  { titleKey: 'grand_canyon',         countryKey: 'usa',          subtitleKey: 'attractions.text5',  descKey: 'attractions.text6',  ctaKey: 'attractions.text7',  href: 'united-states-of-america', img: 'page-arizona'       },
  { titleKey: 'attractions.text8',    countryKey: 'egypt',        subtitleKey: 'attractions.text9',  descKey: 'attractions.text10', ctaKey: 'attractions.text11', href: 'egypt',                    img: 'giza'               },
  { titleKey: null,                   countryKey: 'spain',        subtitleKey: 'attractions.text12', descKey: 'attractions.text13', ctaKey: 'attractions.text14', href: 'spain',                    img: 'granada'            },
  { titleKey: 'attractions.text15',   countryKey: 'china',        subtitleKey: 'attractions.text16', descKey: 'attractions.text17', ctaKey: 'attractions.text18', href: 'china',                    img: 'beijing'            },
  { titleKey: 'attractions.text19',   countryKey: 'brazil',       subtitleKey: 'attractions.text20', descKey: 'attractions.text21', ctaKey: 'attractions.text22', href: 'brazil',                   img: 'iguazu-falls'       },
  { titleKey: null,                   countryKey: 'czech_republic',subtitleKey: 'attractions.text23',descKey: 'attractions.text24', ctaKey: 'attractions.text25', href: 'czech-republic',           img: 'karlstejn'          },
  { titleKey: 'attractions.text26',   countryKey: 'italy',        subtitleKey: 'attractions.text27', descKey: 'attractions.text28', ctaKey: 'attractions.text29', href: 'italy',                    img: 'sardinia'           },
  { titleKey: null,                   countryKey: 'india',        subtitleKey: 'attractions.text30', descKey: 'attractions.text31', ctaKey: 'attractions.text32', href: 'india',                    img: 'agra'               },
  { titleKey: 'attractions.text33',   countryKey: 'australia',    subtitleKey: 'attractions.text34', descKey: 'attractions.text35', ctaKey: 'attractions.text36', href: 'australia',                img: 'cairns'             },
  { titleKey: 'attractions.text37',   countryKey: 'croacia',      subtitleKey: 'attractions.text38', descKey: 'attractions.text39', ctaKey: 'attractions.text40', href: 'croatia',                  img: 'plitvice-lakes'     },
  { titleKey: 'attractions.text41',   countryKey: 'russia',       subtitleKey: 'attractions.text42', descKey: 'attractions.text43', ctaKey: 'attractions.text44', href: 'russia',                   img: 'st-petersburg'      },
  { titleKey: 'attractions.text45',   countryKey: 'south_africa', subtitleKey: 'attractions.text46', descKey: 'attractions.text47', ctaKey: 'attractions.text48', href: 'south-africa',             img: 'kruger-national-park'},
  { titleKey: null,                   countryKey: 'peru',         subtitleKey: 'attractions.text49', descKey: 'attractions.text50', ctaKey: 'attractions.text51', href: 'peru',                     img: 'machu-picchu'       },
  { titleKey: 'attractions.text52',   countryKey: 'greece',       subtitleKey: 'attractions.text53', descKey: 'attractions.text54', ctaKey: 'attractions.text55', href: 'greece',                   img: 'athens'             },
  { titleKey: null,                   countryKey: 'jordan',       subtitleKey: 'attractions.text56', descKey: 'attractions.text57', ctaKey: 'attractions.text58', href: 'jordan',                   img: 'petra'              },
];

/** Extract the attraction name from a subtitle like "Grand Canyon: The world's..." */
function titleFromSubtitle(subtitle: string): string {
  const idx = subtitle.indexOf(':');
  return idx > -1 ? subtitle.slice(0, idx).trim() : subtitle;
}

const AttractionsPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/attractions`;
  const title       = t['attractions.title']       ?? 'Top Attractions Around The World | Country Pick';
  const description = t['attractions.description'] ?? 'Discover amazing tours, top things to do and the best attractions around the world.';

  const seo = {
    title, description, canonical,
    hreflang: buildHreflang('/attractions'),
  };

  return (
    <Layout lang={lang} t={t} seo={seo} continents={continents} hideExplore>
      {/* Hero */}
      <section className="parallax_window_in" style={{ backgroundImage: 'url(https://ik.imagekit.io/bwvxkqzwak0rq/static/img/sub_header_florence_2.jpg)' }}>
        <div id="sub_content_in">
          <div className="country">{t['top_attractions'] ?? 'Top Attractions'}</div>
          <p />
        </div>
      </section>

      {/* Breadcrumb */}
      <div id="position">
        <div className="container">
          <ul>
            <li><Link href={`/${lang}`}>{t['home'] ?? 'Home'}</Link></li>
            <li>{t['top_attractions'] ?? 'Top Attractions'}</li>
          </ul>
        </div>
      </div>

      {/* Items */}
      <div className="pattern_dots_gray">
        <div className="container margin_60">
          <div className="main_title add_bottom_30">
            <h1 className="page-title">
              {t['attractions.text1'] ?? 'Top'}{' '}
              <strong>{t['attractions.text2'] ?? 'Attractions'}</strong>
              {' '}{t['attractions.text3'] ?? 'Around the World'}
            </h1>
            <p>{t['attractions.text4'] ?? 'The top 15 best tourist attractions in the world based on traveler interest.'}</p>
            <span><em /></span>
          </div>

          <div className="row">
            {ATTRACTION_ITEMS.map((item, i) => {
              const subtitle = t[item.subtitleKey] ?? '';
              const itemTitle = item.titleKey
                ? (t[item.titleKey] ?? titleFromSubtitle(subtitle))
                : titleFromSubtitle(subtitle);
              const country   = t[item.countryKey] ?? '';
              const desc      = t[item.descKey]    ?? '';
              const cta       = t[item.ctaKey]     ?? '';

              return (
                <div key={item.href + i} className="col-md-4 col-sm-6 wow fadeIn animated">
                  <div className="img_wrapper">
                    <div className="img_container">
                      <Link href={`/${lang}/${item.href}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          loading={i < 3 ? 'eager' : 'lazy'}
                          src={`https://ik.imagekit.io/bwvxkqzwak0rq/tr:w-400,h-270,f-auto/static/img/gems/${item.img}.jpg`}
                          width={400} height={270}
                          className="img-responsive"
                          alt={itemTitle}
                        />
                        <div className="short_info">
                          <h3>{itemTitle}</h3>
                          <em>{country}</em>
                        </div>
                      </Link>
                    </div>
                  </div>
                  {subtitle && (
                    <div className="attraction-body">
                      <h4>{subtitle}</h4>
                      {desc && <p>{desc}</p>}
                      {cta  && <Link href={`/${lang}/${item.href}`} className="btn_1 small">{cta}</Link>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttractionsPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  return { props: { lang, t: getTranslations(lang), continents } };
};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  