import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getFooterContinents } from '@/lib/queries';
import { getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, pageJsonLd, BASE_URL } from '@/lib/seo';
import { type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[]; activeLangs: { code: string; name: string }[];
}

const IK = 'https://ik.imagekit.io/bwvxkqzwak0rq';

interface AttractionItem {
  /** i18n key for the overlay title, or null for hardcoded */
  titleKey:    string | null;
  /** Hardcoded name shown in overlay when titleKey is null */
  titleFixed?: string;
  countryKey:  string;
  subtitleKey: string;
  /** Set to true for Italy — inserts <em>bellissima</em> after subtitle */
  subtitleBellissima?: boolean;
  descKey:     string;
  ctaKey:      string;
  /** Country page identifier */
  href:        string;
  img:         string;
  gygUrl:      string;
}

const ATTRACTION_ITEMS: AttractionItem[] = [
  {
    titleKey: 'grand_canyon', countryKey: 'usa',
    subtitleKey: 'attractions.text5',  descKey: 'attractions.text6',  ctaKey: 'attractions.text7',
    href: 'united-states-of-america', img: 'flagstaff',
    gygUrl: 'https://www.getyourguide.com/grand-canyon-l489/grand-canyon-south-rim-tour-with-options-from-flagstaff-t176805/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text8', countryKey: 'egypt',
    subtitleKey: 'attractions.text9',  descKey: 'attractions.text10', ctaKey: 'attractions.text11',
    href: 'egypt', img: 'giza',
    gygUrl: 'https://www.getyourguide.com/cairo-region-l553/giza-pyramids-sphinx-and-sakkara-private-full-day-tour-t11731/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: null, titleFixed: 'Alhambra', countryKey: 'spain',
    subtitleKey: 'attractions.text12', descKey: 'attractions.text13', ctaKey: 'attractions.text14',
    href: 'spain', img: 'granada',
    gygUrl: 'https://www.getyourguide.com/granada-l207/skip-the-line-alhambra-and-nasrid-palaces-guided-tour-t102674/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text15', countryKey: 'china',
    subtitleKey: 'attractions.text16', descKey: 'attractions.text17', ctaKey: 'attractions.text18',
    href: 'china', img: 'beijing',
    gygUrl: 'https://www.getyourguide.com/beijing-l186/from-beijing-mutianyu-great-wall-day-tour-t171504/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text19', countryKey: 'brazil',
    subtitleKey: 'attractions.text20', descKey: 'attractions.text21', ctaKey: 'attractions.text22',
    href: 'brazil', img: 'iguazu-falls',
    gygUrl: 'https://www.getyourguide.com/puerto-iguazu-l538/iguassu-falls-tour-t198319/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: null, titleFixed: 'Karlštejn Castle', countryKey: 'czech_republic',
    subtitleKey: 'attractions.text23', descKey: 'attractions.text24', ctaKey: 'attractions.text25',
    href: 'czech-republic', img: 'karlstejn',
    gygUrl: 'https://www.getyourguide.com/prague-l10/karlstejn-castle-from-prague-t55493/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text26', countryKey: 'italy',
    subtitleKey: 'attractions.text27', subtitleBellissima: true,
    descKey: 'attractions.text28', ctaKey: 'attractions.text29',
    href: 'italy', img: 'sardinia',
    gygUrl: 'https://www.getyourguide.com/cagliari-l820/from-cagliari-5-hour-hidden-beaches-shore-excursion-t118606/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: null, titleFixed: 'Taj Mahal', countryKey: 'india',
    subtitleKey: 'attractions.text30', descKey: 'attractions.text31', ctaKey: 'attractions.text32',
    href: 'india', img: 'agra',
    gygUrl: 'https://www.getyourguide.com/new-delhi-l231/skip-the-line-taj-mahal-full-day-tour-from-delhi-t53132/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text33', countryKey: 'australia',
    subtitleKey: 'attractions.text34', descKey: 'attractions.text35', ctaKey: 'attractions.text36',
    href: 'australia', img: 'cairns',
    gygUrl: 'https://www.getyourguide.com/great-barrier-reef-cairns-l2730/1-day-great-barrier-reef-snorkeling-trip-t65125/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text37', countryKey: 'croacia',
    subtitleKey: 'attractions.text38', descKey: 'attractions.text39', ctaKey: 'attractions.text40',
    href: 'croacia', img: 'plitvice-lakes',
    gygUrl: 'https://www.getyourguide.com/plitvice-lakes-national-park-l1326/plitvice-lakes-guided-tour-lower-and-upper-lakes-t56240/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text41', countryKey: 'russia',
    subtitleKey: 'attractions.text42', descKey: 'attractions.text43', ctaKey: 'attractions.text44',
    href: 'russian-federation', img: 'st-petersburg',
    gygUrl: 'https://www.getyourguide.com/st-petersburg-l43/guided-tour-to-hermitage-museum-t130242/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text45', countryKey: 'south_africa',
    subtitleKey: 'attractions.text46', descKey: 'attractions.text47', ctaKey: 'attractions.text48',
    href: 'south-africa', img: 'kruger-national-park',
    gygUrl: 'https://www.getyourguide.com/hazyview-l1589/from-hazyview-full-day-kruger-national-park-safari-t152385/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: null, titleFixed: 'Machu Picchu', countryKey: 'peru',
    subtitleKey: 'attractions.text49', descKey: 'attractions.text50', ctaKey: 'attractions.text51',
    href: 'peru', img: 'machu-picchu',
    gygUrl: 'https://www.getyourguide.com/cusco-l359/machu-picchu-full-day-tour-by-vistadome-train-from-cusco-t167951/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: 'attractions.text52', countryKey: 'greece',
    subtitleKey: 'attractions.text53', descKey: 'attractions.text54', ctaKey: 'attractions.text55',
    href: 'greece', img: 'athens',
    gygUrl: 'https://www.getyourguide.com/athens-l91/the-acropolis-of-athens-skip-the-line-guided-walking-tour-t224313/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
  {
    titleKey: null, titleFixed: 'Petra', countryKey: 'jordan',
    subtitleKey: 'attractions.text56', descKey: 'attractions.text57', ctaKey: 'attractions.text58',
    href: 'jordan', img: 'petra',
    gygUrl: 'https://www.getyourguide.com/eilat-l2663/from-eilat-ancient-city-of-petra-tour-with-buffet-lunch-t175365/?partner_id=NILVP6C&utm_medium=online_publisher&placement=content-end',
  },
];

const AttractionsPage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical   = `${BASE_URL}/${lang}/attractions`;
  const title       = t['attractions.title']       ?? 'Top Attractions Around The World | Country Pick';
  const description = t['attractions.description'] ?? 'Discover amazing tours, top things to do and the best attractions around the world.';

  const ogImage = 'https://ik.imagekit.io/bwvxkqzwak0rq/static/img/sub_header_florence_2.jpg';
  const seo = {
    title, description, canonical,
    ogImage, ogImageAlt: title,
    hreflang: buildHreflang('/attractions'),
    jsonLd: pageJsonLd({
      url: canonical, name: title, description, lang,
      breadcrumbs: [
        { name: t['home'] ?? 'Home', item: `${BASE_URL}/${lang}` },
        { name: t['top_attractions'] ?? 'Top Attractions', item: canonical },
      ],
    }),
  };

  return (
    <Layout activeLangs={activeLangs} lang={lang} t={t} seo={seo} continents={continents}>
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

          {ATTRACTION_ITEMS.map((item, i) => {
            const itemTitle = item.titleKey
              ? (t[item.titleKey] ?? item.titleFixed ?? '')
              : (item.titleFixed ?? '');
            const country  = t[item.countryKey] ?? '';
            const subtitle = t[item.subtitleKey] ?? '';
            const desc     = t[item.descKey]    ?? '';
            const cta      = t[item.ctaKey]     ?? '';

            return (
              <div key={item.href + i} className="strip_list">
                <div className="row">
                  <div className="col-sm-4">
                    <div className="img_wrapper">
                      <div className="img_container">
                        <Link href={`/${lang}/${item.href}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            loading={i < 2 ? 'eager' : 'lazy'}
                            src={`${IK}/tr:w-400,h-270,f-auto/static/img/gems/${item.img}.jpg`}
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
                  </div>
                  <div className="col-sm-8">
                    <div className="desc">
                      {subtitle && (
                        <h4>
                          {subtitle}
                          {item.subtitleBellissima && <>{' '}<em>bellissima</em></>}
                        </h4>
                      )}
                      {desc && <p>{desc}</p>}
                      {cta && (
                        <div>
                          <a
                            href={item.gygUrl}
                            rel="nofollow"
                            target="_blank"
                            className="button small"
                          >
                            {cta}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default AttractionsPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await getActiveLangs()).map(l => ({ params: { lang: l.code } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  const activeLangs = await getActiveLangs();
  return { props: { activeLangs, lang, t: getTranslations(lang), continents } };
};
