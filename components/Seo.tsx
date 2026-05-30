import Head from 'next/head';
import type { PageSEO } from '@/types';

interface SeoProps extends PageSEO {
  lang: string;
}

export default function Seo({ title, description, canonical, ogImage, hreflang, jsonLd, additionalJsonLd, lang }: SeoProps) {
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
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content="Country Pick" />
      {ogImage && <meta property="og:image"       content={ogImage} />}
      {ogImage && <meta property="og:image:width"  content="1305" />}
      {ogImage && <meta property="og:image:height" content="652" />}

      {/* Twitter */}
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

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
