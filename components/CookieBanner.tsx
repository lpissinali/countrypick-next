'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Lang } from '@/types';

interface Props {
  lang: Lang;
  t: Record<string, string>;
}

const STORAGE_KEY = 'cp_consent';

type Consent = 'granted' | 'denied';

function updateGtag(consent: Consent) {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  (window as any).gtag('consent', 'update', {
    analytics_storage:     consent,
    ad_storage:            consent,
    ad_user_data:          consent,
    ad_personalization:    consent,
  });
}

export default function CookieBanner({ lang, t }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
    if (stored) {
      updateGtag(stored);   // restore previous choice on every page load
    } else {
      setVisible(true);     // first visit — show banner
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'granted');
    updateGtag('granted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'denied');
    updateGtag('denied');
    setVisible(false);
  }

  if (!visible) return null;

  const tr = (key: string, fallback: string) => t[key] ?? fallback;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={tr('consent.aria_label', 'Cookie consent')}>
      <div className="cookie-banner__inner">
        <p className="cookie-banner__text">
          {tr('consent.text', 'We use cookies to analyse traffic and show relevant ads.')}{' '}
          <Link href={`/${lang}/cookies`} className="cookie-banner__link">
            {tr('consent.learn_more', 'Learn more')}
          </Link>
        </p>
        <div className="cookie-banner__actions">
          <button className="cookie-banner__btn cookie-banner__btn--decline" onClick={decline}>
            {tr('consent.decline', 'Decline')}
          </button>
          <button className="cookie-banner__btn cookie-banner__btn--accept" onClick={accept}>
            {tr('consent.accept', 'Accept all')}
          </button>
        </div>
      </div>
    </div>
  );
}
