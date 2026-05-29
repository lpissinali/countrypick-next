import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Lang } from '@/types';

const LANG_FLAG: Record<string, string> = { en: 'us', pt: 'br', es: 'es', ru: 'ru' };
const LANG_NAME: Record<string, string> = { en: 'English', pt: 'Português', es: 'Español', ru: 'Русский' };
const LANGS = ['en', 'pt', 'es', 'ru'];

interface HeaderProps {
  lang: Lang;
  t: Record<string, string>;
}

export default function Header({ lang, t }: HeaderProps) {
  const router = useRouter();

  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>('.lang-dropdown__toggle');
    const menu   = document.querySelector<HTMLElement>('.lang-dropdown__menu');
    if (!toggle || !menu) return;

    function handleToggle(e: MouseEvent) {
      e.stopPropagation();
      const isOpen = menu!.classList.toggle('is-open');
      toggle!.setAttribute('aria-expanded', String(isOpen));
    }
    function handleOutside(e: MouseEvent) {
      if (!(e.target as Element).closest('.lang-dropdown')) {
        menu!.classList.remove('is-open');
        toggle!.setAttribute('aria-expanded', 'false');
      }
    }

    toggle.addEventListener('click', handleToggle);
    document.addEventListener('click', handleOutside);
    return () => {
      toggle.removeEventListener('click', handleToggle);
      document.removeEventListener('click', handleOutside);
    };
  }, []);

  /** Build the same URL in a different language */
  function langUrl(newLang: string): string {
    const path = router.asPath; // e.g. /en/moldova
    const parts = path.split('/').filter(Boolean); // ['en', 'moldova']
    parts[0] = newLang;
    return '/' + parts.join('/');
  }

  return (
    <header suppressHydrationWarning>
      <div className="container-fluid">
        <div className="row">
          <div className="col--md-4 col-sm-3 col-xs-4">
            <div id="logo_home">
              <Link href={`/${lang}`} title="Country Pick">
                Country <span>Pick</span>
              </Link>
            </div>
          </div>

          <nav className="col--md-8 col-sm-9 col-xs-8">
            <a
              className="cmn-toggle-switch cmn-toggle-switch__htx open_close"
              href="#"
              onClick={e => e.preventDefault()}
              aria-label="Open menu"
            >
              <span>Menu mobile</span>
            </a>

            {/* Language selector */}
            <div className="lang-dropdown" id="langDropdown">
              <button
                className="lang-dropdown__toggle"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label="Select language"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/static/img/flags/${LANG_FLAG[lang] ?? lang}.png`}
                  alt={lang}
                  className="lang-flag-toggle"
                />
              </button>
              <ul className="lang-dropdown__menu">
                {LANGS.map(l => (
                  <li key={l}>
                    <Link
                      href={langUrl(l)}
                      className={`lang-dropdown__item${lang === l ? ' is-active' : ''}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/static/img/flags/${LANG_FLAG[l] ?? l}.png`}
                        alt={l}
                        className="lang-flag-item"
                      />
                      <span>{LANG_NAME[l]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main navigation */}
            <div className="main-menu">
              <div id="header_menu">
                <Link href={`/${lang}`} title="Country Pick">
                  Country <span>Pick</span>
                </Link>
              </div>
              <a href="#" className="open_close" aria-label="Close menu" id="close_in">
                <i className="icon_close" />
              </a>
              <ul>
                <li>
                  <Link href={`/${lang}/attractions`}>{t['top_attractions'] ?? 'Top Attractions'}</Link>
                </li>
                <li>
                  <Link href={`/${lang}/best-historical-cities`}>{t['historical_cities'] ?? 'Historical Cities'}</Link>
                </li>
                <li>
                  <Link href={`/${lang}/top-natural-places`}>{t['natural_places'] ?? 'Natural Places'}</Link>
                </li>
                <li>
                  <Link href={`/${lang}/adventurous-things-to-do`}>{t['adventure_travel'] ?? 'Adventure Travel'}</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
