import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';

class MyDocument extends Document<{ lang: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { lang: string }> {
    const initialProps = await Document.getInitialProps(ctx);
    // ctx.query.lang is the [lang] segment for all pages under /[lang]/...
    const lang = (ctx.query?.lang as string) || 'en';
    return { ...initialProps, lang };
  }

  render() {
    const lang = (this.props as any).lang || 'en';
    return (
      <Html lang={lang}>
        <Head>
          {/* Google Consent Mode v2 — defaults denied until user accepts */}
          <script dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage:  'denied',
              ad_storage:         'denied',
              ad_user_data:       'denied',
              ad_personalization: 'denied',
              wait_for_update:    500,
              region:             []
            });
            // Suppress Google's own Funding Choices dialog — we handle consent ourselves
            gtag('set', 'no_new_user_default', true);
            gtag('set', 'ads_data_redaction', true);
            gtag('set', 'url_passthrough', true);
          `}} />
          {/* Google Analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-BD3ZB6065B" />
          <script dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5PE55NGFRF', { anonymize_ip: true });
          `}} />
          {/* Google AdSense */}
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4831931651277615" crossOrigin="anonymous" />
          <meta name="google-adsense-account" content="ca-pub-4831931651277615" />
          {/* Resource hints */}
          <link rel="dns-prefetch" href="https://ik.imagekit.io" />
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://maps.googleapis.com" />
          {/* Favicons — self-hosted */}
          <link rel="shortcut icon" href="/static/img/favicon.ico" type="image/x-icon" />
          <link rel="apple-touch-icon" sizes="144x144" href="/static/img/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/img/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/static/img/favicon-16x16.png" />
          <meta name="theme-color" content="#ffffff" />
          {/* Shared meta */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@countrypick" />
          <meta name="twitter:creator" content="@countrypick" />
          <meta name="keywords" content="travel, tours, things to do, attractions, interactive map, country, trip, hidden gems" />
          {/* Site CSS — self-hosted */}
          <link href="/static/css/styles.min.css" rel="stylesheet" />
          {/* Language dropdown styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            .lang-dropdown { position: relative; display: inline-block; }
            .lang-dropdown__toggle { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
            .lang-flag-toggle { width: 24px; height: 16px; object-fit: cover; border-radius: 2px; }
            .lang-flag-item  { width: 20px; height: 14px; object-fit: cover; border-radius: 2px; margin-right: 8px; }
            .lang-dropdown__menu { display: none; position: absolute; right: 0; top: calc(100% + 4px); background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,.15); list-style: none; margin: 0; padding: 4px 0; min-width: 140px; z-index: 9999; }
            .lang-dropdown__menu.is-open { display: block; }
            .lang-dropdown__item { display: flex; align-items: center; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; white-space: nowrap; }
            .lang-dropdown__item:hover { background: #f5f5f5; }
            .lang-dropdown__item.is-active { font-weight: 600; }
          `}} />
          {/* Map widget CSS + Leaflet (homepage only, small enough to load globally) */}
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" crossOrigin="anonymous" />
          <link rel="stylesheet" href="/static/css/map-widget.css" />
          {/* Google Fonts for map widget */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
