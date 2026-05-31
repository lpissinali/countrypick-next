/**
 * AdSense.tsx — renders nothing on the server to prevent hydration mismatch
 * when AdSense injects child iframes before React's hydrateRoot runs.
 */
import { useEffect, useRef, useState } from 'react';

interface AdSenseProps {
  slot: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSense({
  slot,
  format = 'auto',
  className = 'adsbygoogle',
  style = { display: 'block' },
}: AdSenseProps) {
  const [mounted, setMounted] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <ins
      className={className}
      style={style}
      data-ad-client="ca-pub-4831931651277615"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
