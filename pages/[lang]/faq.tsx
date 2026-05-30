import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import StaticPage from '@/components/StaticPage';
import { getFooterContinents , getActiveLangs } from '@/lib/queries';
import { getTranslations } from '@/lib/i18n';
import { buildHreflang, BASE_URL } from '@/lib/seo';
import { LANGS, type Lang, type FooterContinent } from '@/types';

interface Props { lang: Lang; t: Record<string, string>; continents: FooterContinent[]; activeLangs: { code: string; name: string }[];
}

const FaqPage: NextPage<Props> = ({ lang, t, continents, activeLangs }) => {
  const canonical   = `${BASE_URL}/${lang}/faq`;
  const title       = t['faq.title']       ?? 'Frequently Asked Questions | Country Pick';
  const description = t['faq.description'] ?? 'Frequently asked questions about Country Pick. Find answers about exploring countries and discovering top things to do around the world.';

  const seo = {
    title,
    description,
    canonical,
    hreflang: buildHreflang('/faq'),
  };

  return (
    <StaticPage activeLangs={activeLangs} lang={lang} t={t} continents={continents} seo={seo} breadcrumb={t['{faq}'] ?? 'FAQ'}>
      <div className="main_title add_bottom_30">
        <h3>Frequently Asked <strong>Questions</strong></h3>
        <span><em /></span>
      </div>

      <div className="row">
        <div className="col-md-3" id="sidebar">
          <div className="theiaStickySidebar">
            <div className="box_style_1" id="faq_box">
              <ul id="cat_nav">
                <li><a href="#about" className="active">About Country Pick</a></li>
                <li><a href="#using">Using the Site</a></li>
                <li><a href="#travel">Travel Information</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <h3 className="nomargin_top" id="about">About Country Pick</h3>
          <div className="panel-group">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#about" href="#faq-what">
                    What is Country Pick?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-what" className="panel-collapse collapse">
                <div className="panel-body">
                  Country Pick is a travel exploration platform that helps you discover countries, cities, and hidden gems around the world. Browse curated lists of top attractions, historical cities, natural wonders, and adventure experiences, then find hotels and activities to plan your trip.
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#about" href="#faq-free">
                    Is Country Pick free to use?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-free" className="panel-collapse collapse">
                <div className="panel-body">
                  Yes. Country Pick is completely free to browse. We display advertising and earn a commission when you book hotels through our Agoda partner links, which keeps the site free for everyone.
                </div>
              </div>
            </div>
          </div>

          <h3 id="using">Using the Site</h3>
          <div className="panel-group">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#using" href="#faq-nav">
                    How do I find a destination?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-nav" className="panel-collapse collapse">
                <div className="panel-body">
                  Use the interactive map on the homepage to click any country, or browse by continent using the footer links. Each country page lists its top cities, and each city page shows the best things to do along with available hotels.
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#using" href="#faq-hotels">
                    How do the hotel listings work?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-hotels" className="panel-collapse collapse">
                <div className="panel-body">
                  Hotel results are powered by Agoda and loaded directly on each city page. Click any hotel to be taken to Agoda where you can view full details and complete your booking. Country Pick earns a small affiliate commission on completed bookings at no extra cost to you.
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#using" href="#faq-langs">
                    What languages is the site available in?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-langs" className="panel-collapse collapse">
                <div className="panel-body">
                  Country Pick is available in English, Portuguese, Spanish, and Russian. Use the language selector in the top navigation to switch languages at any time.
                </div>
              </div>
            </div>
          </div>

          <h3 id="travel">Travel Information</h3>
          <div className="panel-group">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#travel" href="#faq-accuracy">
                    How accurate is the travel information?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-accuracy" className="panel-collapse collapse">
                <div className="panel-body">
                  We strive to keep destination guides, attraction listings, and country facts up to date. However, travel conditions, visa requirements, and local regulations change frequently. Always verify essential travel information with official sources — such as your government&rsquo;s foreign affairs department — before travelling.
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h4 className="panel-title">
                  <a className="accordion-toggle" data-toggle="collapse" data-parent="#travel" href="#faq-contact">
                    How can I get in touch?<i className="indicator ficon-plus pull-right" />
                  </a>
                </h4>
              </div>
              <div id="faq-contact" className="panel-collapse collapse">
                <div className="panel-body">
                  You can reach us at <a href="mailto:contact@countrypick.com">contact@countrypick.com</a>. We aim to respond within 48 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaticPage>
  );
};

export default FaqPage;

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
