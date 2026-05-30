import Head from 'next/head';
import type { PageSEO } from '@/types';

interface SeoProps extends PageSEO {
  lang: string;
}

export default function Seo({
  title, description, canonical, ogImage, ogImageAlt, ogType = 'website',
  ogLocale, hreflang, jsonLd, additionalJsonLd, lang,
}: SeoProps) {
  const locale = ogLocale ?? langToLocale(lang);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* hreflang */}
      {hreflang.map(h => (
        <link key={h.hreflang} rel="alternate" hrefLang={h.hreflang} href={h.href} />
      ))}

      {/* Open Graph */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:locale"      content={locale} />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content="Country Pick" />
      {ogImage && <meta property="og:image"        content={ogImage} />}
      {ogImage && <meta property="og:image:width"  content="1305" />}
      {ogImage && <meta property="og:image:height" content="652" />}
      {ogImage && <meta property="og:image:type"   content="image/jpeg" />}
      {ogImage && <meta property="og:image:alt"    content={ogImageAlt ?? title} />}

      {/* Twitter */}
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image"     content={ogImage} />}
      {ogImage && <meta name="twitter:image:alt" content={ogImageAlt ?? title} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {additionalJsonLd?.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </Head>
  );
}

function langToLocale(lang: string): string {
  const map: Record<string, string> = {
    en: 'en_US', pt: 'pt_BR', es: 'es_ES', ru: 'ru_RU',
  };
  return map[lang] ?? 'en_US';
}
