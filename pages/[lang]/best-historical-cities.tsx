import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const ITEMS: CategoryItem[] = [
  { label: 'Verona, Italy',     href: '/[lang]/italy/verona',               img: 'verona'          },
  { label: 'Granada, Spain',    href: '/[lang]/spain/granada',              img: 'granada'         },
  { label: 'Loire Valley',      href: '/[lang]/france/loire-valley',        img: 'loire-valley'    },
  { label: 'Athens, Greece',    href: '/[lang]/greece/athens',              img: 'athens'          },
  { label: 'Petra, Jordan',     href: '/[lang]/jordan/petra',               img: 'petra'           },
  { label: 'Vienna, Austria',   href: '/[lang]/austria/vienna',             img: 'vienna'          },
  { label: 'Český Krumlov',     href: '/[lang]/czech-republic/cesky-krumlov', img: 'cesky-krumlov' },
  { label: 'Jerusalem, Israel', href: '/[lang]/israel/jerusalem',           img: 'jerusalem'       },
  { label: "Xi'an, China",      href: '/[lang]/china/xian',                img: 'xian'            },
  { label: 'Moscow, Russia',    href: '/[lang]/russia/moscow',              img: 'moscow'          },
  { label: 'Luxor, Egypt',      href: '/[lang]/egypt/luxor',               img: 'luxor'           },
  { label: 'Budapest, Hungary', href: '/[lang]/hungary/budapest',           img: 'budapest'        },
];

const HistoricalPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/best-historical-cities`;
  const title       = t['historical.title']       ?? 'Best Historical Cities to Visit | Country Pick';
  const description = t['historical.description'] ?? 'Discover the best historical cities around the world to visit.';

  const items = ITEMS.map(i => ({ ...i, href: i.href.replace('/[lang]/', `/${lang}/`) }));

  return (
    <CategoryPage
      lang={lang} t={t} continents={continents}
      seo={{ title, description, canonical, hreflang: buildHreflang('/best-historical-cities') }}
      heroTitle={[t['historical.text1'] ?? 'Best', t['historical.text2'] ?? 'Historical Cities', t['historical.text3'] ?? 'in the World']}
      heroSub={t['historical.text4'] ?? 'A guide to the must-see historical places around the world.'}
      items={items}
    />
  );
};

export default HistoricalPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  return { props: { lang, t: getTranslations(lang), continents } };
};
