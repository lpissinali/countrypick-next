import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';

const GA_ID = 'G-BD3ZB6065B';

export default function App({ Component, pageProps }: AppProps) {
  const lang = pageProps.lang ?? 'en';
  const t    = pageProps.t    ?? {};
  return (
    <>
      <Component {...pageProps} />
      <CookieBanner lang={lang} t={t} />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { anonymize_ip: true });
      `}</Script>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4831931651277615"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
    </>
  );
}
