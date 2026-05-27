import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5PE55NGFRF" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5PE55NGFRF');
        `}} />
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4831931651277615" crossOrigin="anonymous" />
        <meta name="google-adsense-account" content="ca-pub-4831931651277615" />
        {/* Resource hints */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        {/* Favicons */}
        <link rel="shortcut icon" href="https://ik.imagekit.io/bwvxkqzwak0rq/static/img/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="144x144" href="https://ik.imagekit.io/bwvxkqzwak0rq/static/img/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://ik.imagekit.io/bwvxkqzwak0rq/static/img/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://ik.imagekit.io/bwvxkqzwak0rq/static/img/favicon-16x16.png" />
        <meta name="theme-color" content="#ffffff" />
        {/* Shared meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@countrypick" />
        <meta name="keywords" content="travel, tours, things to do, attractions, interactive map, country, trip, hidden gems" />
        {/* Site CSS — served from ImageKit CDN */}
        <link href="https://ik.imagekit.io/bwvxkqzwak0rq/static/css/styles.min.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
