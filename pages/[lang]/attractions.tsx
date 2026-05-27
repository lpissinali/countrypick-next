import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const ITEMS: CategoryItem[] = [
  { label: 'Grand Canyon',      href: '/[lang]/united-states-of-america/grand-canyon', img: 'grand-canyon'      },
  { label: 'Giza Pyramids',     href: '/[lang]/egypt/giza',                            img: 'giza'              },
  { label: 'Alhambra, Granada', href: '/[lang]/spain/granada',                         img: 'granada'           },
  { label: 'Great Wall of China',href:'/[lang]/china/beijing',                         img: 'beijing'           },
  { label: 'Iguazú Falls',      href: '/[lang]/argentina/iguazu-falls',                img: 'iguazu-falls'      },
  { label: 'Karlštejn Castle',  href: '/[lang]/czech-republic/karlstejn',              img: 'karlstejn'         },
  { label: 'Sardinia Beaches',  href: '/[lang]/italy/sardinia',                        img: 'sardinia'          },
  { label: 'Taj Mahal',         href: '/[lang]/india/agra',                            img: 'agra'              },
  { label: 'Great Barrier Reef',href: '/[lang]/australia/cairns',                      img: 'cairns'            },
  { label: 'Plitvice Lakes',    href: '/[lang]/croatia/plitvice-lakes',                img: 'plitvice-lakes'    },
  { label: 'Hermitage Museum',  href: '/[lang]/russia/st-petersburg',                  img: 'st-petersburg'     },
  { label: 'Kruger National Park',href:'/[lang]/south-africa/kruger-national-park',   img: 'kruger-national-park'},
  { label: 'Machu Picchu',      href: '/[lang]/peru/cusco',                            img: 'cusco'             },
  { label: 'Acropolis of Athens',href:'/[lang]/greece/athens',                         img: 'athens'            },
  { label: 'Petra, Jordan',     href: '/[lang]/jordan/petra',                          img: 'petra'             },
];

const AttractionsPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical = `${BASE_URL}/${lang}/attractions`;
  const title       = t['attractions.title']       ?? 'Top Attractions Around The World | Country Pick';
  const description = t['attractions.description'] ?? 'Discover amazing tours, top things to do and the best attractions around the world.';

  // Replace [lang] placeholder with actual lang
  const items = ITEMS.map(i => ({ ...i, href: i.href.replace('/[lang]/', `/${lang}/`) }));

  return (
    <CategoryPage
      lang={lang} t={t} continents={continents}
      seo={{ title, description, canonical, hreflang: buildHreflang('/attractions') }}
      heroTitle={[t['attractions.text1'] ?? 'Top', t['attractions.text2'] ?? 'Attractions', t['attractions.text3'] ?? 'Around the World']}
      heroSub={t['attractions.text4'] ?? 'The top best tourist attractions in the world based on traveler interest.'}
      items={items}
    />
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
