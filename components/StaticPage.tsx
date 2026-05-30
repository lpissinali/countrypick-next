/**
 * Shell for legal / info pages (FAQ, Terms, Privacy, Cookies).
 * Renders a parallax hero + breadcrumb + content inside a padded container.
 */
import Link from 'next/link';
import Layout from './Layout';
import type { Lang, FooterContinent, PageSEO } from '@/types';

interface Props {
  lang:       Lang;
  t:          Record<string, string>;
  continents: FooterContinent[];
  seo:        PageSEO;
  breadcrumb: string;          // label for the current page in breadcrumb
  children:   React.ReactNode;
  activeLangs: { code: string; name: string }[];
}

export default function StaticPage({ lang, t, continents, seo, breadcrumb, children, activeLangs }: Props) {
  return (
    <Layout activeLangs={activeLangs} lang={lang} t={t} seo={seo} continents={continents} hideExplore>
      {/* Hero */}
      <section
        className="parallax_window_in"
        style={{ backgroundImage: 'url(https://ik.imagekit.io/bwvxkqzwak0rq/static/img/gallery/it.jpg)' }}
      >
        <div id="sub_content_in">
          <div id="sub_content_in_left">
            <div className="container">
              <div className="row">
                <div className="col-xs-12">
                  <div className="country">{breadcrumb}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div id="position">
        <div className="container">
          <ul>
            <li><Link href={`/${lang}`}>{t['home'] ?? 'Home'}</Link></li>
            <li>{breadcrumb}</li>
          </ul>
        </div>
      </div>

      {/* Page body */}
      <div className="pattern_dots_gray">
        <div className="container margin_60">
          {children}
        </div>
      </div>
    </Layout>
  );
}
