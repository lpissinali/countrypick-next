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
  hideExplore?: boolean;
}

export default function Layout({ children, lang, t, seo, continents, hideExplore }: LayoutProps) {
  // Set the lang cookie so common_scripts_min.js can read it for #lang-selector
  useEffect(() => {
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }, [lang]);

  return (
    <>
      <Seo {...seo} lang={lang} />
      {/* Hidden select required by common_scripts_min.js jQuery (#lang-selector).
          No defaultValue — jQuery reads the lang cookie and sets selected itself. */}
      <select id="lang-selector" style={{ display: 'none' }} suppressHydrationWarning
        onChange={() => {/* jQuery handles navigation */}}>
        <option value="en">EN</option>
        <option value="pt">PT</option>
        <option value="es">ES</option>
        <option value="ru">RU</option>
      </select>
      <div className="layer" />
      <Header lang={lang} t={t} />
      {children}
      <Footer lang={lang} t={t} continents={continents} hideExplore={hideExplore} />
    </>
  );
}
