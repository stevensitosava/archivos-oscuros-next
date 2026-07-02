"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import type { Book } from "../types";
import { CATEGORIES } from "../types";

const REPEAT = 4;
const WAVE_NUMBER = 0.55;
const WAVE_SPEED = 1;

const labelFor = (slug: Book["category"]) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

const FONT = {
  fontSize: "clamp(0.7rem, 3.1vw, 2.3rem)",
  fontWeight: 700,
  lineHeight: 0.95,
  letterSpacing: "-0.02em",
} as const;

/**
 * Dual-wave book index (awwwards scroll/31). Imperative scroll listener + direct
 * transforms. Two columns at every width — titles left → /libro, categories right
 * → /catalogo — undulate horizontally around a sticky center cover. On desktop the
 * cover is a middle column between them; on mobile it overlaps the middle rows from
 * behind. Focused (viewport-centered) line goes white and drives the cover.
 */
function DualWaveAnimated({ lines }: { lines: Book[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftCol = useRef<HTMLDivElement>(null);
  const rightCol = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const rightRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const imgMobileRef = useRef<HTMLImageElement>(null);
  const ranges = useRef({ left: 0, right: 0 });
  const currentImg = useRef("");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      const frac = window.innerWidth < 640 ? 0.1 : 0.4;
      ranges.current = {
        left: (leftCol.current?.offsetWidth ?? 0) * frac,
        right: (rightCol.current?.offsetWidth ?? 0) * frac,
      };
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
      const { left: lr, right: rr } = ranges.current;

      for (let i = 0; i < lines.length; i++) {
        const w = (Math.sin(WAVE_NUMBER * i + WAVE_SPEED * progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
        const le = leftRefs.current[i];
        const re = rightRefs.current[i];
        if (le) le.style.transform = `translateX(${(w * lr).toFixed(1)}px)`;
        if (re) re.style.transform = `translateX(${(-w * rr).toFixed(1)}px)`;
      }

      const center = vh / 2;
      let fi = 0;
      let md = Infinity;
      for (let i = 0; i < leftRefs.current.length; i++) {
        const el = leftRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - center);
        if (d < md) {
          md = d;
          fi = i;
        }
      }
      for (let i = 0; i < lines.length; i++) {
        leftRefs.current[i]?.classList.toggle("dw-focused", i === fi);
        rightRefs.current[i]?.classList.toggle("dw-focused", i === fi);
      }

      const book = lines[fi];
      if (book && book.cover.image && currentImg.current !== book.cover.image) {
        currentImg.current = book.cover.image;
        if (imgRef.current) imgRef.current.src = book.cover.image;
        if (imgMobileRef.current) imgMobileRef.current.src = book.cover.image;
      }
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [lines]);

  return (
    <section ref={sectionRef} className="relative py-[12vh] sm:py-[14vh]">
      <p className="eyebrow mb-[8vh] text-center sm:mb-[10vh]">El archivo · {lines.length / REPEAT} títulos</p>
      <div className="relative mx-auto flex max-w-7xl items-start justify-between gap-[7vw] px-5 sm:gap-[4vw] sm:px-6">
        {/* mobile center cover — overlaps the middle rows from behind */}
        <div className="pointer-events-none absolute inset-0 z-0 flex justify-center sm:hidden">
          <img
            ref={imgMobileRef}
            src={lines[0]?.cover.image}
            alt=""
            aria-hidden="true"
            className="sticky top-[32vh] max-h-[30vh] w-[44vw] self-start rounded-md object-contain opacity-80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)]"
          />
        </div>

        {/* titles — left column (mobile + desktop) */}
        <div
          ref={leftCol}
          className="relative z-[2] flex min-w-0 flex-1 flex-col items-start gap-3.5 text-left sm:gap-5"
          style={FONT}
        >
          {lines.map((b, i) => (
            <Link
              key={`l-${i}`}
              ref={(el) => {
                leftRefs.current[i] = el;
              }}
              href={`/libro/${b.slug}`}
              className="dw-line"
            >
              {b.title}
            </Link>
          ))}
        </div>

        {/* desktop center cover — sticky middle column */}
        <div className="pointer-events-none sticky top-[33vh] z-[1] hidden w-[20vw] shrink-0 justify-center self-start sm:flex">
          <img
            ref={imgRef}
            src={lines[0]?.cover.image}
            alt=""
            aria-hidden="true"
            className="max-h-[34vh] w-auto max-w-full rounded-md object-contain shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* categories — right column (mobile + desktop) */}
        <div
          ref={rightCol}
          className="relative z-[2] flex min-w-0 flex-1 flex-col items-end gap-3.5 text-right sm:gap-5"
          style={FONT}
        >
          {lines.map((b, i) => (
            <Link
              key={`r-${i}`}
              ref={(el) => {
                rightRefs.current[i] = el;
              }}
              href={`/catalogo?cat=${b.category}`}
              className="dw-line"
            >
              {labelFor(b.category)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Reduced-motion fallback — static 3-card grid. */
function StaticFallback({ books }: { books: Book[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow mb-3 text-center">El archivo</p>
      <h2 className="mb-10 text-center text-[clamp(1.9rem,5vw,2.8rem)]">El archivo esencial</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {books.map((b) => (
          <Link key={b.id} href={`/libro/${b.slug}`} className="group block">
            <div className="aspect-[2/3] overflow-hidden rounded-lg bg-ink-800">
              <img src={b.cover.image} alt={`Portada de ${b.title}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </div>
            <h3 className="mt-3 font-garamond text-[1.05rem] leading-tight text-bone-50">{b.title}</h3>
            <p className="text-[0.78rem] uppercase tracking-[0.12em] text-ash-400">{labelFor(b.category)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DualWave({ books }: { books: Book[] }) {
  const reduce = useReducedMotion();
  const lines = useMemo(() => {
    const a: Book[] = [];
    for (let r = 0; r < REPEAT; r++) a.push(...books);
    return a;
  }, [books]);

  if (reduce) return <StaticFallback books={books} />;
  return <DualWaveAnimated lines={lines} />;
}
