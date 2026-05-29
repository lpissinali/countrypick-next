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

  return