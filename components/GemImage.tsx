import { useState, useRef, useEffect } from 'react';

interface GemImageProps {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}

/**
 * Renders an image with a fallback URL.
 * Handles both pre-hydration failures (useEffect check) and
 * post-hydration failures (onError synthetic event).
 */
export default function GemImage({ src, fallback, alt, className, loading = 'lazy', style }: GemImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Image may have already failed before React hydrated
    const img = ref.current;
    if (img && img.complete && img.naturalWidth <= 1 && imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  }, [fallback, imgSrc]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      onError={() => { if (imgSrc !== fallback) setImgSrc(fallback); }}
      onLoad={(e) => {
        // ImageKit returns a 1×1 px stub for missing files — treat as broken
        const img = e.currentTarget;
        if (img.naturalWidth <= 1 && imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
}
