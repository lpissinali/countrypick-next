import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import { getFooterContinents } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[] }

const TermsPage: NextPage<Props> = ({ lang, t, continents }) => {
  const canonical   = `${BASE_URL}/${lang}/terms`;
  const title       = 'Terms and Conditions - Country Pick';
  const description = 'Read the Terms and Conditions governing your use of Country Pick, the travel platform for exploring countries and discovering hidden gems worldwide.';

  const seo = {
    title,
    description,
    canonical,
    hreflang: buildHreflang('/terms'),
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
    <StaticPage lang={lang} t={t} continents={continents} seo={seo} breadcrumb={t['{terms_conditions}'] ?? 'Terms and Conditions'}>
      <div className="main_title add_bottom_30">
        <h3>Terms and <strong>Conditions</strong></h3>
        <p>Last updated: April 25, 2026</p>
        <span><em /></span>
      </div>

      <p>Welcome to Country Pick. By accessing or using <a href="https://www.countrypick.com">www.countrypick.com</a> (the &ldquo;Website&rdquo;), you agree to be bound by these Terms and Conditions. Please read them carefully. If you do not agree with any part of these terms, you must not use our Website.</p>

      <h2>1. About Country Pick</h2>
      <p>Country Pick is a travel exploration platform that allows visitors to discover countries, cities, and hidden gems around the world; browse curated lists of top attractions, historical cities, natural wonders, and adventure destinations; and find hotel accommodation through our partner Agoda.</p>
      <p>Country Pick is operated by Country Pick (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). You can reach us at <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>.</p>

      <h2>2. Acceptable Use</h2>
      <p>When using Country Pick, you agree not to:</p>
      <ol>
        <li>Use the Website for any unlawful purpose or in any way that violates applicable local, national, or international law;</li>
        <li>Use automated tools (bots, scrapers, or crawlers) to access or extract data from the Website without our prior written consent;</li>
        <li>Attempt to gain unauthorised access to any part of the Website or its infrastructure;</li>
        <li>Transmit any malware, viruses, or other harmful code;</li>
        <li>Interfere with or disrupt the integrity or performance of the Website.</li>
      </ol>

      <h2>3. Intellectual Property</h2>
      <p>All content on Country Pick &mdash; including text, graphics, logos, icons, images, country data, and software &mdash; is the property of Country Pick or its licensors and is protected by applicable intellectual property laws.</p>
      <p>You may view and print pages from the Website for personal, non-commercial use only. You must not republish, sell, rent, reproduce, or redistribute any material from Country Pick without our express written permission.</p>

      <h2>4. Travel Information and Accuracy</h2>
      <p>Country Pick provides travel information, destination guides, and attraction listings for informational purposes only. While we strive to keep content accurate and up to date, we make no warranties regarding the completeness, accuracy, or timeliness of any travel information on the Website.</p>
      <p>Travel conditions, visa requirements, entry restrictions, safety advisories, and local regulations change frequently. You are solely responsible for verifying all travel-related information with official sources before making any travel decisions. Country Pick accepts no liability for any loss or inconvenience arising from reliance on information published on the Website.</p>

      <h2>5. Third-Party Services and Links</h2>
      <p>Country Pick integrates with or links to third-party services, including:</p>
      <ol>
        <li><strong>Agoda</strong> &mdash; hotel and accommodation search. Any booking you make is governed solely by Agoda&rsquo;s own terms and conditions. Country Pick is not a party to any such transaction.</li>
        <li><strong>Google Analytics</strong> &mdash; used to analyse Website usage. Data collection is governed by Google&rsquo;s Privacy Policy.</li>
        <li><strong>Google AdSense</strong> &mdash; used to display relevant advertisements. Ad content is served and governed by Google.</li>
        <li><strong>Social platforms</strong> &mdash; links to Facebook and X for sharing. Your use of those platforms is governed by their respective terms.</li>
      </ol>
      <p>We are not responsible for the content, policies, or practices of any third-party websites or services linked from the Website.</p>

      <h2>6. Advertising</h2>
      <p>Country Pick displays third-party advertisements through Google AdSense. Advertisements are clearly distinguished from editorial content. We do not endorse any advertised products or services.</p>

      <h2>7. Privacy and Cookies</h2>
      <p>Your use of Country Pick is also governed by our <Link href={`/${lang}/privacy`}>Privacy Policy</Link> and <Link href={`/${lang}/cookies`}>Cookies Policy</Link>, both of which are incorporated into these Terms by reference.</p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>The Website and all its content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without any warranty of any kind, express or implied. To the fullest extent permitted by law, Country Pick disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

      <h2>9. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law, Country Pick shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Website, including loss of data, revenue, or profits. Nothing in these Terms limits our liability for death or personal injury caused by our negligence, or any other liability that cannot be excluded by law.</p>

      <h2>10. Changes to These Terms</h2>
      <p>We may update these Terms and Conditions from time to time. When we do, we will revise the &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of the Website after changes are posted constitutes your acceptance of the revised Terms.</p>

      <h2>11. Governing Law</h2>
      <p>These Terms and Conditions are governed by and construed in accordance with applicable law. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts.</p>

      <h2>12. Contact Us</h2>
      <p>If you have any questions about these Terms and Conditions, please contact us:</p>
      <p>
        <strong>Country Pick</strong><br />
        Email: <a href="mailto:contact@countrypick.com">contact@countrypick.com</a><br />
        Website: <a href="https://www.countrypick.com">www.countrypick.com</a>
      </p>
    </StaticPage>
  );
};

export default TermsPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANGS.map(lang => ({ params: { lang } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const lang = (params?.lang as Lang) ?? 'en';
  const continents = await getFooterContinents(lang);
  return { props: { lang, t: getTranslations(lang), continents } };
};
