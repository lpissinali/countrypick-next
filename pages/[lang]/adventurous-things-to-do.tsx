import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import CategoryPage, { type CategoryItem } from '@/components/CategoryPage';
import { getFooterContinents , getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, pageJsonLd, BASE_URL } from '@/lib/seo';
import { type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[]; activeLangs: { code: string; name: string }[];
}

const AdventurePage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical   = `${BASE_URL}/${lang}/adventurous-things-to-do`;
  const title       = t['adventure.title']       ?? 'Adventurous Things To Do Around the World | CountryPick.com';
  const description = t['adventure.description'] ?? 'Top places around the world for adventure lovers to visit.';

  const items: CategoryItem[] = [
    { label: t['adventure.text4']  ?? 'Arenal Volcano Rafting and Canopy Adventure', country: t['costa_rica']   ?? 'Costa Rica',    href: `/${lang}/costa-rica`,              img: 'arenal-volcano'  },
    { label: t['adventure.text5']  ?? 'Perito Moreno Glacier Ice Trekking',          country: t['argentina']    ?? 'Argentina',     href: `/${lang}/argentina`,               img: 'ushuaia'         },
    { label: t['adventure.text6']  ?? 'Husky Sledding in Tromsø',                    country: t['norway']       ?? 'Norway',        href: `/${lang}/norway`,                  img: 'tromso'          },
    { label: t['adventure.text7']  ?? 'Wild Dolphin Swim',                           country: t['australia']    ?? 'Australia',     href: `/${lang}/australia`,               img: 'perth'           },
    { label: t['adventure.text8']  ?? 'Shark Cage Dive',                             country: t['south_africa'] ?? 'South Africa',  href: `/${lang}/south-africa`,            img: 'plettenberg-bay' },
    { label: t['adventure.text9']  ?? 'Bungy Jump off Bridge',                       country: t['new_zealand']  ?? 'New Zealand',   href: `/${lang}/new-zealand`,             img: 'christchurch'    },
    { label: t['adventure.text10'] ?? 'Helicopter Parachute Jump',                   country: t['switzerland']  ?? 'Switzerland',   href: `/${lang}/switzerland`,             img: 'interlaken'      },
    { label: t['adventure.text11'] ?? 'White Water Rafting',                         country: t['slovenia']     ?? 'Slovenia',      href: `/${lang}/slovenia`,                img: 'lake-bled'       },
    { label: t['adventure.text12'] ?? 'Caving in Leidarendi',                        country: t['iceland']      ?? 'Iceland',       href: `/${lang}/iceland`,                 img: 'reykjavik'       },
  ];

  return (
    <CategoryPage
      activeLangs={activeLangs} lang={lang} t={t} continents={continents}
      seo={{
        title, description, canonical,
        ogImage: 'https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/nz.jpg?v=2',
        ogImageAlt: title,
        hreflang: buildHreflang('/adventurous-things-to-do', activeLangs),
        jsonLd: pageJsonLd({
          url: canonical, name: title, description, lang,
          breadcrumbs: [
            { name: t['home'] ?? 'Home', item: `${BASE_URL}/${lang}` },
            { name: t['adventure_travel'] ?? 'Adventure Travel', item: canonical },
          ],
        }),
      }}
      heroImg="nz.jpg"
      heroLabel={t['adventure_travel'] ?? 'Adventure Travel'}
      breadcrumbKey="adventure_travel"
      heroTitle={[
        t['adventure.text1'] ?? 'The World\'s',
        t['adventure.text2'] ?? 'Most Adventurous Places',
        t['adventure.text2b'] ?? 'to Visit',
      ]}
      heroSub={t['adventure.text3'] ?? 'For travelers seeking an adrenaline-packed adventure, here\'s the top places adventure seekers should visit.'}
      items={items}
    />
  );
};

export default AdventurePage;

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
