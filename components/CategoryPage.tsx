/**
 * Shared shell for Historical Cities, Natural Places, Adventure Travel pages.
 * Attractions has its own richer layout in pages/[lang]/attractions.tsx.
 */
import Link from 'next/link';
import Layout from './Layout';
import type { Lang, FooterContinent, PageSEO } from '@/types';

export interface CategoryItem {
  label:    string;
  href:     string;   // full path e.g. /en/spain
  img:      string;   // ImageKit gem slug
  country?: string;   // translated country name shown under the label
}

interface Props {
  lang:          Lang;
  t:             Record<string, string>;
  continents:    FooterContinent[];
  seo:           PageSEO;
  heroImg:       string;   // gallery image filename e.g. 'nz.jpg' or full URL
  heroLabel:     string;   // short label inside the banner .country div
  heroTitle:     [string, string, string];  // [before, bold, after] — used in h1
  heroSub:       string;   // subtitle under the h1
  items:         CategoryItem[];
  breadcrumbKey?: string;  // i18n key for breadcrumb e.g. 'adventure_travel'
}

const IK = 'https://ik.imagekit.io/bwvxkqzwak0rq';

export default function CategoryPage({
  lang, t, continents, seo,
  heroImg, heroLabel, heroTitle, heroSub,
  items, breadcrumbKey,
}: Props) {

  // heroImg can be a slug like 'nz.jpg' or a full URL
  const bgUrl = heroImg.startsWith('http')
    ? heroImg
    : `${IK}/static/img/gallery/${heroImg}`;

  const breadcrumb = breadcrumbKey
    ? (t[breadcrumbKey] ?? `${heroTitle[0]} ${heroTitle[1]}`)
    : `${heroTitle[0]} ${heroTitle[1]}`;

  return (
    <Layout lang={lang} t={t} seo={seo} continents={continents} hideExplore>

      {/* ── Banner ── */}
      <section className="parallax_window_in" style={{ backgroundImage: `url(${bgUrl})` }}>
        <div id="sub_content_in">
          <div className="country">{heroLabel}</div>
          <p />
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div id="position">
        <div className="container">
          <ul>
            <li><Link href={`/${lang}`}>{t['home'] ?? 'Home'}</Link></li>
            <li>{breadcrumb}</li>
          </ul>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="pattern_dots_gray">
        <div className="container margin_60">

          <div className="main_title add_bottom_30">
            <h1 className="page-title">
              {heroTitle[0]}{' '}<strong>{heroTitle[1]}</strong>
              {heroTitle[2] ? ' ' + heroTitle[2] : ''}
            </h1>
            <p>{heroSub}</p>
            <span><em /></span>
          </div>

          <div className="row">
            {items.map((item, i) => (
              <div key={item.href + i} className="col-sm-4 wow fadeIn animated">
                <div className="img_wrapper">
                  <div className="img_container">
                    <Link href={item.href}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        loading="lazy"
                        src={`${IK}/tr:w-400,h-2