"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

/** Local hero loop in /public. Swap the file to change the background. */
const HERO_VIDEO = "/hero-video.mp4";
/** Playback speed for the hero clip. */
const PLAYBACK_RATE = 2.5;

/** Drip-edged fill polygon (9 top points + 2 bottom corners). `ys` = top-edge heights %. */
const dripPoly = (ys: number[]) =>
  `polygon(0% ${ys[0]}%, 12% ${ys[1]}%, 25% ${ys[2]}%, 37% ${ys[3]}%, 50% ${ys[4]}%, 62% ${ys[5]}%, 75% ${ys[6]}%, 87% ${ys[7]}%, 100% ${ys[8]}%, 100% 100%, 0% 100%)`;
const CLIP_HIDDEN = dripPoly([100, 100, 100, 100, 100, 100, 100, 100, 100]);
const CLIP_FILLED = dripPoly([50, 59, 47, 62, 46, 60, 48, 57, 50]);

/** Splits text into characters and fades each in with a 0.06s stagger, once in view. */
function StaggeredFade({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const chars = Array.from(text);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: "0.15em" }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bleed, setBleed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const setRate = () => {
      v.playbackRate = PLAYBACK_RATE;
    };
    setRate();
    v.addEventListener("loadedmetadata", setRate);
    v.addEventListener("play", setRate);
    return () => {
      v.removeEventListener("loadedmetadata", setRate);
      v.removeEventListener("play", setRate);
    };
  }, []);

  // Blood fills ARCHIVOS shortly after load (or as soon as the video ends, whichever is first).
  useEffect(() => {
    const v = videoRef.current;
    const start = () => setBleed(true);
    v?.addEventListener("ended", start);
    const timer = window.setTimeout(start, 450);
    return () => {
      v?.removeEventListener("ended", start);
      clearTimeout(timer);
    };
  }, []);

  return (
    // h-dvh (not h-screen): 100vh on iOS Safari is the LARGE viewport, which
    // pushes the CTA row behind the bottom toolbar. dvh tracks the visible area.
    <section className="relative -mt-24 flex h-dvh min-h-[600px] w-full flex-col overflow-hidden">
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
        src={HERO_VIDEO}
        autoPlay
        muted
        playsInline
        aria-hidden="true"
      />

      {/* Legibility scrim */}
      <div
        className="absolute inset-0 z-[5]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, rgba(1,1,1,0.2) 0%, rgba(1,1,1,0.5) 55%, rgba(1,1,1,0.82) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-28 sm:px-8 sm:pb-16 sm:pt-32 lg:px-12">
        {/* Title — ARCHIVOS over OSCUROS, centered */}
        <div className="text-center">
          <h1
            className="relative inline-block uppercase leading-[0.82] text-bone-50"
            style={{ fontWeight: 800, letterSpacing: "-0.04em", fontSize: "clamp(3.2rem, 17.5vw, 15rem)" }}
          >
            <StaggeredFade text="ARCHIVOS" className="block whitespace-nowrap" />

            {/* Blood fill — crimson gradient clipped to the bottom half of the letters */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 block whitespace-nowrap text-center"
              style={{
                color: "transparent",
                backgroundImage: "linear-gradient(180deg, #d63b2f 0%, #9a1c12 65%, #5e1009 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                clipPath: CLIP_HIDDEN,
              }}
              animate={{ clipPath: bleed ? CLIP_FILLED : CLIP_HIDDEN }}
              transition={{ duration: 1.9, ease: [0.5, 0, 0.2, 1] }}
            >
              ARCHIVOS
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="mt-1 uppercase leading-none text-bone-50"
            style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: "clamp(1.9rem, 6vw, 4.5rem)" }}
          >
            Oscuros
          </motion.p>
        </div>

        {/* Flanking row — tagline (left) + buttons (right), warrior in the middle */}
        <div className="mt-auto flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            className="max-w-xs text-sm font-light leading-relaxed text-white/75 sm:max-w-[15rem] sm:text-base"
          >
            Estoicismo, historia y códigos de guerreros. Sabiduría dura para forjar el carácter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
            className="flex flex-col items-center gap-2.5 sm:items-end"
          >
            {/* Free book is the PRIMARY ask for a first visit — cold traffic
                won't buy on day one, but it will take a free book. */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
              <Link
                href="/gratis"
                onClick={() => trackEvent("hero_cta_click", { cta: "gratis" })}
                className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_30px_rgba(178,52,42,0.45)] transition-colors hover:bg-ember-400 sm:py-4"
              >
                Libro gratis
              </Link>
              <Link
                href="/catalogo"
                onClick={() => trackEvent("hero_cta_click", { cta: "catalogo" })}
                className="liquid-glass inline-block rounded-full px-6 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white/90 sm:px-8 sm:py-4 sm:tracking-[0.2em]"
              >
                Entra en el archivo
              </Link>
            </div>
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-white/55" style={{ fontFamily: "var(--font-ritual)" }}>
              Sin tarjeta · Tuyo en 1 minuto
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade into the page */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-40"
        aria-hidden="true"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-ink-950))" }}
      />
    </section>
  );
}
