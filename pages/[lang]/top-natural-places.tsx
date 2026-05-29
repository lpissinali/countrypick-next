import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const NaturalPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/top-natural-places`;
  const title       = t['natural.title']       ?? 'Top Natural Places To Visit | Country Pick';
  const description = t['natural.description'] ?? 'Top 12 most beautiful natural places around the world to visit.';

  const items: CategoryItem[] = [
    { label: t['natural.text5']  ?? 'Top 5 Things To Do In Cairns',                    country: t['australia']    ?? 'Australia',    href: `/${lang}/australia`,              img: 'cairns'            },
    { label: t['natural.text6']  ?? 'Best Things To Do In Iguazú Falls',               country: t['brazil']       ?? 'Brazil',       href: `/${lang}/brazil`,                 img: 'iguazu-falls'      },
    { label: t['natural.text7']  ?? 'Top Things To Do In Page - Arizona',              country: t['usa']          ?? 'United States', href: `/${lang}/united-states-of-america`, img: 'page-arizona'    },
    { label: t['natural.text8']  ?? 'Top Things To Do In Uluru-Kata Tjuta',            country: t['australia']    ?? 'Australia',    href: `/${lang}/australia`,              img: 'uluru-kata'        },
    { label: t['natural.text9']  ?? 'Go To Kruger National Park',                      country: t['south_africa'] ?? 'South Africa', href: `/${lang}/south-africa`,           img: 'kruger-national-park' },
    { label: t['natural.text10'] ?? 'Top Things To Do In Phuket',                      country: t['thailand']     ?? 'Thailand',     href: `/${lang}/thailand`,               img: 'phuket'            },
    { label: t['natural.text11'] ?? 'Top Things To Do In Arenal Volcano',              country: t['costa_rica']   ?? 'Costa Rica',   href: `/${lang}/costa-rica`,             img: 'arenal-volcano'    },
    { label: t['natural.text12'] ?? 'Best Things To Do In Langjökull Glacier',         country: t['iceland']      ?? 'Iceland',      href: `/${lang}/iceland`,                img: 'langjokull-glacier' },
    { label: t['natural.text13'] ?? 'Top Things To Do In Tromsø',                      country: t['norway']       ?? 'Norway',       href: `/${lang}/norway`,                 img: 'tromso'            },
    { label: t['natural.text14'] ?? 'Top Things To Do In Cappadocia',                  country: t['turkey']       ?? 'Turkey',       href: `/${lang}/turkey`,                 img: 'cappadocia'        },
    { label: t['natural.text15'] ?? 'Top Things To Do In Kranjska Gora',               country: t['slovenia']     ?? 'Slovenia',     href: `/${lang}/slovenia`,               img: 'kranjska-gora'     },
    { label: t['natural.text16'] ?? 'Visit Plitvice Lakes',                            country: t['croacia']      ?? 'Croatia',      href: `/${lang}/croatia`,                img: 'plitvice-lakes'    },
  ];

  return (
    <CategoryPage
      lang={lang} t={t} continents={continents}
      seo={{ title, description, canonical, hreflang: buildHreflang('/top-natural-places') }}
      heroImg="no.jpg"
      heroLabel={t['natural_places'] ?? 'Natural Places'}
      breadcrumbKey="natural_places"
      heroTitle={[
        t['natural.text1'] ?? 'The Most',
        t['natural.text2'] ?? 'Beautiful Places',
        t['natural.text3'] ?? 'for Nature Lovers',
      ]}
      heroSub={t['natural.text4'] ?? 'Startlingly impressive Natural Places to visit around the world'}
      items={items}
    />
  );
};

export default NaturalPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  return { props: { lang, t: getTranslations(lang), continents } };
};
