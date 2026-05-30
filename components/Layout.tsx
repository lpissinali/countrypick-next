import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Seo from './Seo';
import type { Lang, FooterContinent, PageSEO } from '@/types';

interface LayoutProps {
  children: ReactNode;
  lang: Lang;
  t: Record<string, string>;
  seo: PageSEO;
  continents: FooterContinent[];
  activeLangs: { code: string; name: string }[];
  hideExplore?: boolean;
}

export default function Layout({ children, lang, t, seo, continents, activeLangs, hideExplore }: LayoutProps) {
  useEffect(() => {
    document.cookie = 'lang=' + lang + '; path=/; max-age=31536000; SameSite=Lax';
  }, [lang]);

  return (
    <>
      <Seo {...seo} lang={lang} />
      <select id="lang-selector" style={{ display: 'none' }} suppressHydrationWarning
        onChange={() => {/* jQuery handles navigation */}}>
        {activeLangs.map(l => <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>)}
      </select>
      <div className="layer" />
      <Header lang={lang} t={t} activeLangs={activeLangs} />
      {children}
      <Footer lang={lang} t={t} continents={continents} hideExplore={hideExplore} />
    </>
  );
}
