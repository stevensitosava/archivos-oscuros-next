"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Book-cover image via next/image — automatic AVIF/WebP with a responsive
 * srcset, lazy loading, and no layout shift. A shimmer skeleton shows until
 * the image loads, then it fades in. Sits inside a `.cover-frame`
 * (position: relative, aspect-ratio 2/3).
 */
export default function CoverImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  /** true for the LCP cover (book detail) — preloads + disables lazy. */
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        // Covers render ~half the viewport on mobile, a quarter on desktop grids.
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
