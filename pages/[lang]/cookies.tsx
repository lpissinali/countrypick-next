import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import { getFooterContinents , getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[]; activeLangs: { code: string; name: string }[];
}

const CookiesPage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical   = `${BASE_URL}/${lang}/cookies`;
  const title       = 'Cookies Policy - Country Pick';
  const description = 'Learn how Country Pick uses cookies and similar technologies to operate the website and serve relevant advertising.';

  const seo = {
    title,
    description,
    canonical,
    hreflang: buildHreflang('/cookies'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: canonical,
      description,
      isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website` },
      publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization` },
      dateModified: '2026-04-25',
      inLanguage: 'en-US',
    },
  };

  return (
    <StaticPage activeLangs={activeLangs} lang={lang} t={t} continents={continents} seo={seo} breadcrumb={t['{cookies_policy}'] ?? 'Cookies Policy'}>
      <div className="main_title add_bottom_30">
        <h3>Cookies <strong>Policy</strong></h3>
        <p>Last updated: April 25, 2026</p>
        <span><em /></span>
      </div>

      <p>Country Pick uses cookies and similar technologies to operate the Website, remember your preferences, analyse traffic, and serve relevant advertising. This policy explains what cookies we use and why.</p>
      <p>For information on how we handle your personal data more broadly, please see our <Link href={`/${lang}/privacy`}>Privacy Policy</Link>.</p>

      <h2>What Is a Cookie?</h2>
      <p>A cookie is a small text file placed on your device by a website you visit. Cookies are widely used to make websites work efficiently and to provide information to website owners. They do not contain executable code and cannot access other data on your device.</p>

      <h2>Types of Cookies We Use</h2>

      <h3>Essential Cookies</h3>
      <p>These cookies are strictly necessary for the Website to function. Without them, parts of the site would not work. They do not require your consent.</p>

      <h3>Functional Cookies</h3>
      <p>These cookies remember choices you have made, such as your preferred language, so the Website can provide a more personalised experience on return visits.</p>

      <h3>Analytics Cookies</h3>
      <p>We use Google Analytics to understand how visitors interact with the Website &mdash; which pages are most visited, how long people stay, and where they come from. This helps us improve content and performance. The data collected is aggregated and anonymised.</p>

      <h3>Advertising Cookies</h3>
      <p>We use Google AdSense to display advertisements on the Website. Google and its partners use cookies to show ads based on your previous visits to this and other websites. You can opt out of personalised advertising at any time via <a href="https://adssettings.google.com" target="_blank" rel="nofollow">Google&rsquo;s Ad Settings</a>.</p>

      <h2>Cookies We Use</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th style={{ width: 140 }}>Category</th>
              <th style={{ width: 180 }}>Cookie Name</th>
              <th>Purpose</th>
              <th style={{ width: 130 }}>Expiry</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential</td>
              <td>cookiePolicyConsent</td>
              <td>Stores your cookie consent preference so we do not ask again on every visit.</td>
              <td>1 year</td>
            </tr>
            <tr>
              <td>Functional</td>
              <td>lang</td>
              <td>Remembers your language preference so the Website is shown in the correct language.</td>
              <td>1 year</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>_ga</td>
              <td>Google Analytics &mdash; distinguishes unique visitors and tracks usage statistics.</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>_gid</td>
              <td>Google Analytics &mdash; identifies a user session.</td>
              <td>24 hours</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>_gat</td>
              <td>Google Analytics &mdash; throttles the request rate to Google servers.</td>
              <td>1 minute</td>
            </tr>
            <tr>
              <td>Advertising</td>
              <td>NID</td>
              <td>Google &mdash; stores your preferences to personalise ads shown on Google&rsquo;s network.</td>
              <td>6 months</td>
            </tr>
            <tr>
              <td>Advertising</td>
              <td>IDE</td>
              <td>Google DoubleClick &mdash; records and reports actions after viewing or clicking an ad.</td>
              <td>1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Managing Your Cookie Preferences</h2>
      <p>You can control and manage cookies in several ways. Please be aware that removing or blocking cookies may affect your experience on the Website.</p>
      <p><strong>Via your browser settings:</strong> most browsers allow you to view, block, or delete cookies.</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="nofollow">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="nofollow">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="nofollow">Apple Safari</a></li>
        <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="nofollow">Microsoft Edge</a></li>
      </ul>
      <p><strong>Opt out of Google Analytics:</strong> install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="nofollow">Google Analytics Opt-out Browser Add-on</a>.</p>
      <p><strong>Opt out of personalised advertising:</strong> visit <a href="https://adssettings.google.com" target="_blank" rel="nofollow">Google Ad Settings</a>, <a href="https://www.youronlinechoices.eu" target="_blank" rel="nofollow">Your Online Choices (EU)</a>, or <a href="https://optout.aboutads.info" target="_blank" rel="nofollow">AboutAds (US)</a>.</p>

      <h2>Changes to This Policy</h2>
      <p>We may update this Cookies Policy from time to time. Changes will be reflected by the &ldquo;Last updated&rdquo; date above.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about our use of cookies, please contact us at <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.</p>
    </StaticPage>
  );
};

export default CookiesPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
    const activeLangs = await getActiveLangs();
  return { props: { activeLangs,
      lang, t: getTranslations(lang), continents } };
};
