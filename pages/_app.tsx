import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import CookieBanner from '@/components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  const lang = pageProps.lang ?? 'en';
  const t    = pageProps.t    ?? {};
  return (
    <>
      <Component {...pageProps} />
      <CookieBanner lang={lang} t={t} />
    </>
  );
}
