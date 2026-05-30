import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Lang } from '@/types';

const LANG_FLAG: Record<string, string> = { en: 'us', pt: 'br', es: 'es', ru: 'ru' };
const LANG_NAME: Record<string, string> = { en: 'English', pt: 'Português', es: 'Español', ru: 'Русский' };

interface HeaderProps {
  lang: Lang;
  t: Record<string, string>;
  activeLangs: { code: string; name: string }[];
}

export default function Header({ lang, t, activeLangs }: HeaderProps) {
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

  function langUrl(newLang: string): string {
    const path = router.asPath;
    const parts = path.split('/').filter(Boolean);
    parts[0] = newLang;
    return '/' + parts.join('/');
  }

  const isHome = router.asPath === `/${lang}` || router.asPath === `/${lang}/`;

  return (
    <header className={isHome ? 'sticky' : undefined} suppressHydrationWarning>
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
                {activeLangs.map(l => (
                  <li key={l.code}>
                    <Link
                      href={langUrl(l.code)}
                      className={`lang-dropdown__item${lang === l.code ? ' is-active' : ''}`}
                      onClick={() => {
                        const menu = document.querySelector<HTMLElement>('.lang-dropdown__menu');
                        const toggle = document.querySelector<HTMLButtonElement>('.lang-dropdown__toggle');
                        menu?.classList.remove('is-open');
                        toggle?.setAttribute('aria-expanded', 'false');
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/static/img/flags/${LANG_FLAG[l.code] ?? l.code}.png`}
                        alt={l.code}
                        className="lang-flag-item"
                      />
                      <span>{l.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

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
