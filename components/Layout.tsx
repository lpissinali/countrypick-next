import type { ReactNode } from 'react';
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
  hideExplore?: boolean;
}

export default function Layout({ children, lang, t, seo, continents, hideExplore }: LayoutProps) {
  return (
    <>
      <Seo {...seo} lang={lang} />
      <div className="layer" />
      <Header lang={lang} t={t} />
      {children}
      <Footer lang={lang} t={t} continents={continents} hideExplore={hideExplore} />
    </>
  );
}
