import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const ITEMS: CategoryItem[] = [
  { label: 'Cairns, Australia',                  href: '/[lang]/australia/cairns',                    img: 'cairns'                },
  { label: 'Iguazú Falls, Argentina',            href: '/[lang]/argentina/iguazu-falls',              img: 'iguazu-falls'          },
  { label: 'Page, Arizona',                      href: '/[lang]/united-states-of-america/page-arizona', img: 'page-arizona'        },
  { label: 'Uluru-Kata Tjuta National Park',     href: '/[lang]/australia/uluru-kata',                img: 'uluru-kata'            },
  { label: 'Kruger National Park',               href: '/[lang]/south-africa/kruger-national-park',   img: 'kruger-national-park'  },
  { label: 'Phuket, Thailand',                   href: '/[lang]/thailand/phuket',                     img: 'phuket'                },
  { label: 'Arenal Volcano, Costa Rica',         href: '/[lang]/costa-rica/arenal',                   img: 'arenal'                },
  { label: 'Langjökull Glacier, Iceland',        href: '/[lang]/iceland/langjokull-glacier',           img: 'langjokull-glacier'    },
  { label: 'Tromsø, Norway',                     href: '/[lang]/norway/tromso',                       img: 'tromso'                },
  { label: 'Cappadocia, Turkey',                 href: '/[lang]/turkey/cappadocia',                   img: 'cappadocia'            },
  { label: 'Kranjska Gora, Slovenia',            href: '/[lang]/slovenia/kranjska-gora',              img: 'kranjska-gora'         },
  { label: 'Plitvice Lakes, Croatia',            href: '/[lang]/croatia/plitvice-lakes',              img: 'plitvice-lakes'        },
];

const NaturalPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/top-natural-places`;
  const title       = t['natural.title']       ?? 'Top Natural Places To Visit | Country Pick';
  const description = t['natural.description'] ?? 'Top 12 most beautiful natural places around the world to visit.';

  const items = ITEMS.map(i => ({ ...i, href: i.href.replace('/[lang]/', `/${lang}/`) }));

  return (
    <CategoryPage
      lang={lang} t={t} continents={continents}
      seo={{ title, description, canonical, hreflang: buildHreflang('/top-natural-places') }}
      heroTitle={[t['natural.text1'] ?? 'The Most', t['natural.text2'] ?? 'Beautiful Places', t['natural.text3'] ?? 'for Nature Lovers']}
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
