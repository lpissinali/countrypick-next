import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const ITEMS: CategoryItem[] = [
  { label: 'Bungee Jumping, Queenstown',  href: '/[lang]/new-zealand/queenstown',               img: 'queenstown'            },
  { label: 'Safari, Kruger Park',          href: '/[lang]/south-africa/kruger-national-park',    img: 'kruger-national-park'  },
  { label: 'Skydiving, Interlaken',        href: '/[lang]/switzerland/interlaken',               img: 'interlaken'            },
  { label: 'Trekking, Machu Picchu',       href: '/[lang]/peru/cusco',                           img: 'cusco'                 },
  { label: 'Scuba Diving, Great Barrier Reef', href: '/[lang]/australia/cairns',                 img: 'cairns'                },
  { label: 'Volcano Hike, Arenal',         href: '/[lang]/costa-rica/arenal',                    img: 'arenal'                },
  { label: 'Northern Lights, Tromsø',      href: '/[lang]/norway/tromso',                        img: 'tromso'                },
  { label: 'Hot Air Balloon, Cappadocia',  href: '/[lang]/turkey/cappadocia',                    img: 'cappadocia'            },
  { label: 'Glacier Walk, Langjökull',     href: '/[lang]/iceland/langjokull-glacier',            img: 'langjokull-glacier'    },
  { label: 'White-Water Rafting, Cairns',  href: '/[lang]/australia/cairns',                     img: 'cairns'                },
  { label: 'Rock Climbing, Page Arizona',  href: '/[lang]/united-states-of-america/page-arizona', img: 'page-arizona'         },
  { label: 'Jungle Trek, Phuket',          href: '/[lang]/thailand/phuket',                      img: 'phuket'                },
];

const AdventurePage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/adventurous-things-to-do`;
  const title       = t['adventure.title']       ?? 'Most Adventurous Things To Do | Country Pick';
  const description = t['adventure.description'] ?? 'Discover the most adventurous things to do around the world.';

  const items = ITEMS.map(i => ({ ...i, href: i.href.replace('/[lang]/', `/${lang}/`) }));

  return (
    <CategoryPage
      lang={lang} t={t} continents={continents}
      seo={{ title, description, canonical, hreflang: buildHreflang('/adventurous-things-to-do') }}
      heroTitle={[t['adventure.text1'] ?? 'Most', t['adventure.text2'] ?? 'Adventurous Things', t['adventure.text3'] ?? 'To Do']}
      heroSub={t['adventure.text4'] ?? 'The most thrilling and adventurous experiences around the world.'}
      items={items}
    />
  );
};

export default AdventurePage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  return { props: { lang, t: getTranslations(lang), continents } };
};
