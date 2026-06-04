import '@/styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';

const GA_ID = 'G-5PE55NGFRF';

export default function App({ Component, pageProps }: AppProps) {
  const lang = pageProps.lang ?? 'en';
  const t    = pageProps.t    ?? {};

  // Load AdSense after hydration via useEffect to avoid:
  // 1. data-nscript warning (caused by Next.js Script component)
  // 2. Hydration mismatch (#418) caused by auto ads modifying DOM before React hydrates
  useEffect(() => {
    if (document.querySelector('script[src*="adsbygoogle"]')) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4831931651277615';
    script.crossOrigin = 'anonymous';
    // Disable top anchor/overlay ads — they inject before <header> outside React's tree
    script.onload = () => {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({
          google_ad_client: 'ca-pub-4831931651277615',
          overlays: { bottom: true },  // allow bottom anchor only, not top
        });
      } catch {
        // Ignore — happens in StrictMode (double-invoke) or if AdSense already initialized
      }
    };
    document.head.appendChild(script);
  }, []);

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
    </>
  );
}
