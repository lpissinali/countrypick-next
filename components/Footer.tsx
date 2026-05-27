import Link from 'next/link';
import type { Lang, FooterContinent } from '@/types';

interface FooterProps {
  lang: Lang;
  t: Record<string, string>;
  continents: FooterContinent[];
  hideExplore?: boolean;
}

export default function Footer({ lang, t, continents, hideExplore }: FooterProps) {
  return (
    <>
      {/* Continent / country grid — great for internal linking and SEO */}
      {!hideExplore && continents.length > 0 && (
        <section className="explore-countries-section">
          <div className="container">
            <div className="main_title">
              <h3>
                {t['explore'] ?? 'Explore'}{' '}
                <strong>{t['the_world'] ?? 'the World'}</strong>
              </h3>
              <span><em /></span>
            </div>
            <div className="explore-countries-grid">
              {continents.map(continent => (
                <div key={continent.name} className="explore-continent-col">
                  <h4>{continent.name}</h4>
                  <ul>
                    {continent.countries.map(country => (
                      <li key={country.identifier}>
                        <Link href={`/${lang}/${country.identifier}`}>
                          {country.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer>
        <div className="container-fluid footer-container">
          <div id="logo_footer">
            <Link href="/" title="Country Pick">
              Country <span>Pick</span>
            </Link>
          </div>
          <hr />
          <div className="footer-bottom">
            <div className="footer-copy">
              © CountryPick 2026 – {t['rights'] ?? 'All Rights Reserved'}
            </div>
            <ul className="footer-links">
              <li><Link href={`/${lang}/terms`}>{t['terms_conditions'] ?? 'Terms and Conditions'}</Link></li>
              <li><Link href={`/${lang}/privacy`}>{t['privacy_policy'] ?? 'Privacy Policy'}</Link></li>
              <li><Link href={`/${lang}/cookies`}>{t['cookies_policy'] ?? 'Cookies Policy'}</Link></li>
            </ul>
            <ul className="footer-social">
              <li>
                <a
                  href="https://www.facebook.com/countrypick/"
                  aria-label="Facebook"
                  target="_blank"
                  rel="nofollow noreferrer"
                >
                  <i className="ficon-facebook" />
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/intent/tweet?text=Create%20your%20custom%20map%20of%20visited%20countries%20at%20https://www.countrypick.com"
                  target="_blank"
                  aria-label="X (Twitter)"
                  rel="nofollow noreferrer"
                >
                  <svg className="icon-x" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.002 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Site JS (menu toggle etc.) — served from ImageKit CDN */}
      <script src="https://ik.imagekit.io/bwvxkqzwak0rq/static/js/common_scripts_min.js" async />
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var dropdown = document.getElementById('langDropdown');
          if (!dropdown) return;
          var toggle = dropdown.querySelector('.lang-dropdown__toggle');
          toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            var open = dropdown.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open);
          });
          document.addEventListener('click', function() {
            dropdown.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
          });
          dropdown.addEventListener('click', function(e) { e.stopPropagation(); });
        })();
      `}} />
    </>
  );
}
