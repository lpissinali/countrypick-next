import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const PrivacyPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/privacy`;
  const title       = 'Privacy Policy - Country Pick';
  const description = 'Learn how Country Pick collects, uses, and protects your personal data when you visit our travel exploration platform.';

  const seo = {
    title,
    description,
    canonical,
    hreflang: buildHreflang('/privacy'),
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
    <StaticPage lang={lang} t={t} continents={continents} seo={seo} breadcrumb={t['{privacy_policy}'] ?? 'Privacy Policy'}>
      <div className="main_title add_bottom_30">
        <h3>Privacy <strong>Policy</strong></h3>
        <p>Last updated: April 25, 2026</p>
        <span><em /></span>
      </div>

      <p>Country Pick (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains what data we collect when you visit <a href="https://www.countrypick.com">www.countrypick.com</a> (the &ldquo;Website&rdquo;), how we use it, and your rights in relation to it.</p>
      <p>Please read this policy alongside our <Link href={`/${lang}/terms`}>Terms and Conditions</Link> and <Link href={`/${lang}/cookies`}>Cookies Policy</Link>.</p>

      <h2>1. Who We Are</h2>
      <p>Country Pick is a travel exploration platform. If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.</p>

      <h2>2. What Data We Collect</h2>
      <p>As a visitor to Country Pick, we collect only the data necessary to operate and improve the Website.</p>

      <h3>Usage and Technical Data</h3>
      <p>When you visit the Website, we automatically collect certain technical information, including your IP address (anonymised where possible), browser type and version, operating system, referring URL, pages visited, time spent on pages, and general geographic location (country or city level). This data is collected via Google Analytics and does not identify you personally.</p>

      <h3>Language Preference</h3>
      <p>We store your selected language in a cookie so that the Website is displayed in your preferred language on return visits.</p>

      <h3>Cookie Data</h3>
      <p>We use cookies and similar technologies to operate the Website and serve relevant advertising. For full details, see our <Link href={`/${lang}/cookies`}>Cookies Policy</Link>.</p>

      <h3>Contact Enquiries</h3>
      <p>If you contact us via email, we collect your name, email address, and the content of your message in order to respond to your enquiry. This data is not used for any other purpose.</p>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li><strong>Operating the Website</strong> &mdash; to deliver pages correctly and remember your language preference.</li>
        <li><strong>Analytics</strong> &mdash; to understand how visitors use the Website so we can improve content and performance. We use Google Analytics for this purpose.</li>
        <li><strong>Advertising</strong> &mdash; to display relevant advertisements through Google AdSense. Google may use data from your visit to personalise ads shown to you on Country Pick and other websites.</li>
        <li><strong>Responding to enquiries</strong> &mdash; to reply to messages sent via email.</li>
        <li><strong>Legal compliance</strong> &mdash; to comply with applicable laws and regulations.</li>
      </ul>

      <h2>4. Legal Basis for Processing (GDPR)</h2>
      <p>For visitors in the European Economic Area (EEA), our legal bases for processing personal data are:</p>
      <ul>
        <li><strong>Legitimate interests</strong> &mdash; for analytics and Website security.</li>
        <li><strong>Consent</strong> &mdash; for advertising and non-essential cookies, which we seek via our cookie consent notice.</li>
        <li><strong>Legal obligation</strong> &mdash; where processing is required to comply with applicable law.</li>
      </ul>

      <h2>5. Third-Party Services</h2>
      <ul>
        <li><strong>Google Analytics</strong> &mdash; receives anonymised usage data. See <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Google&rsquo;s Privacy Policy</a>.</li>
        <li><strong>Google AdSense</strong> &mdash; serves advertisements and may use cookies to personalise ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="nofollow">Google&rsquo;s Privacy Policy</a>.</li>
        <li><strong>Agoda</strong> &mdash; when you click on hotel listings, you are directed to Agoda&rsquo;s platform. Any data you provide to Agoda is governed by <a href="https://www.agoda.com/info/privacy.html" target="_blank" rel="nofollow">Agoda&rsquo;s Privacy Policy</a>.</li>
        <li><strong>ImageKit</strong> &mdash; used to serve and optimise images on the Website.</li>
      </ul>
      <p>We do not sell your personal data to any third party.</p>

      <h2>6. International Transfers</h2>
      <p>Some of our third-party providers (including Google) may process data outside the European Economic Area. Where this occurs, we rely on appropriate safeguards such as Standard Contractual Clauses approved by the European Commission.</p>

      <h2>7. Data Retention</h2>
      <p>Analytics data is typically retained for 26 months within Google Analytics. Contact enquiry data is retained for as long as needed to resolve your request and for a reasonable period thereafter.</p>

      <h2>8. Your Rights</h2>
      <p>Depending on your location, you may have rights to access, correct, erase, restrict, or port your personal data, to object to processing, and to withdraw consent. To exercise any of these rights, please contact us at <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.</p>

      <h2>9. Data Security</h2>
      <p>We take appropriate technical and organisational measures to protect your data against accidental loss, unauthorised access, disclosure, or destruction. However, no transmission over the internet is completely secure.</p>

      <h2>10. Children</h2>
      <p>Country Pick is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>

      <h2>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be reflected by the &ldquo;Last updated&rdquo; date at the top of this page.</p>

      <h2>12. Contact Us</h2>
      <p>
        <strong>Country Pick</strong><br />
        Email: <a href="mailto:contact@countrypick.com">contact@countrypick.com</a><br />
        Website: <a href="https://www.countrypick.com">www.countrypick.com</a>
      </p>
    </StaticPage>
  );
};

export default PrivacyPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  return { props: { lang, t: getTranslations(lang), continents } };
};
