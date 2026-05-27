/**
 * Shared shell for Top Attractions, Historical Cities, Natural Places,
 * Adventure Travel pages. Each page passes its own items + translations.
 */
import Link from 'next/link';
import Layout from './Layout';
import type { Lang, FooterContinent, PageSEO } from '@/types';

export interface CategoryItem {
  label: string;
  href:  string;   // full path e.g. /en/spain/granada
  img:   string;   // ImageKit gem slug
}

interface Props {
  lang:       Lang;
  t:          Record<string, string>;
  continents: FooterContinent[];
  seo:        PageSEO;
  heroTitle:  [string, string, string];  // [before, bold, after]
  heroSub:    string;
  items:      CategoryItem[];
}

export default function CategoryPage({ lang, t, continents, seo, heroTitle, heroSub, items }: Props) {
  return (
    <Layout lang={lang} t={t} seo={seo} continents={continents} hideExplore>
      {/* Hero */}
      <section className="parallax_window_in" style={{ backgroundImage: 'url(https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/it.jpg)' }}>
        <div id="sub_content_in">
          <div id="sub_content_in_left">
            <div className="container">
              <div className="row">
                <div className="col-xs-12">
                  <div className="country">
                    {heroTitle[0]}{' '}<strong>{heroTitle[1]}</strong>{heroTitle[2] ? ' ' + heroTitle[2] : ''}
                  </div>
                  <span>{heroSub}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="position">
        <div className="container">
          <ul>
            <li><Link href={`/${lang}`}>{t['home'] ?? 'Home'}</Link></li>
            <li>{heroTitle[0]} {heroTitle[1]}</li>
          </ul>
        </div>
      </div>

      <div className="container margin_60">
        <div className="row">
          {items.map(item => (
            <div key={item.href} className="col-md-4 col-sm-6 wow fadeIn animated">
              <div className="img_wrapper">
                <div className="img_container">
                  <Link href={item.href}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      loading="lazy"
                      src={`https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gems/${item.img}.jpg`}
                      className="img-responsive"
                      alt={item.label}
                    />
                    <div className="short_info">
                      <h3>{item.label}</h3>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
