import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const HistoricalPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/best-historical-cities`;
  const title       = t['historical.title']       ?? 'Best Historical Cities to Visit | Country Pick';
  const description = t['historical.description'] ?? 'Discover the best historical cities around the world to visit.';

  const items: CategoryItem[] = [
    { label: t['historical.text5']  ?? 'Best Things To Do In Verona',       country: t['italy']          ?? 'Italy',         href: `/${lang}/italy`,          img: 'verona'        },
    { label: t['historical.text6']  ?? 'Top Things To Do In Granada',        country: t['spain']          ?? 'Spain',         href: `/${lang}/spain`,          img: 'granada'       },
    { label: t['historical.text7']  ?? 'Best Things To Do In Loire Valley',  country: t['france']         ?? 'France',        href: `/${lang}/france`,         img: 'loire-valley'  },
    { label: t['historical.text8']  ?? 'Best Things To Do In Athens',        country: t['greece']         ?? 'Greece',        href: `/${lang}/greece`,         img: 'athens'        },
    { label: t['historical.text9']  ?? 'Top Things To Do In Petra',          country: t['jordan']         ?? 'Jordan',        href: `/${lang}/jordan`,         img: 'petra'         },
    { label: t['historical.text10'] ?? 'Top Things To Do In Vienna',         country: t['austria']        ?? 'Austria',       href: `/${lang}/austria`,        img: 'vienna'        },
    { label: t['historical.text11'] ?? 'Top Things To Do In Český Krumlov', country: t['czech_republic'] ?? 'Czech Republic', href: `/${lang}/czech-republic`, img: 'cesky-krumlov' },
    { label: t['historical.text12'] ?? 'Best Things To Do In Jerusalem',     country: t['israel']         ?? 'Israel',        href: `/${lang}/israel`,         img: 'jerusalem'     },
    { label: t['historical.text13'] ?? "Top Things To Do In Xi'an",         country: t['china']          ?? 'China',         href: `/${lang}/china`,          img: 'xian'          },
    { label: t['historical.text14'] ?? 'Top Things To Do In Moscow',         country: t['russia']         ?? 'Russia',        href: `/${lang}/russia`,         img: 'moscow'        },
    { label: t['historical.text15'] ?? 'Top Things To Do In Luxor',          country: t['egypt']          ?? 'Egypt',         href: `/${lang}/egypt`,          img: 'luxor'         },
    { label: t['historical.text16'] ?? 'Top Things To Do In Budapest',       country: t['hungary']        ?? 'Hungary',       href: `/${lang}/hungary`,        img: 'budapest'      },
  ];

  return (
    <CategoryPage
      lang={lang} t={t} continents={continents}
      seo={{ title, description, canonical, hreflang: buildHreflang('/best-historical-cities') }}
      heroImg="hu.jpg"
      heroLabel={t['historical_cities'] ?? 'Historical Cities'}
      breadcrumbKey="historical_cities"
      heroTitle={[
        t['historical.text1'] ?? 'Best',
        t['historical.text2'] ?? 'Historical Cities',
        t['historical.text3'] ?? 'in the World',
      ]}
      heroSub={t['historical.text4'] ?? 'This guide to the must see historical places around the world help you plan what you should visit on your next vacation.'}
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
  const continents = await getFooterCo