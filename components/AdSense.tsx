/**
 * AdSense.tsx
 *
 * Pushes the ad unit inside useEffect (after mount + layout), which avoids the
 * "No slot size for availableWidth=0" error that occurs when push() runs during
 * HTML parsing before the container has its final dimensions.
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
      // ignore — happens when AdSense script hasn't loaded yet
    }
  }, [mounted]);

  // Render nothing on the server — prevents hydration mismatch when
  // AdSense injects child iframes before React's hydrateRoot runs.
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
