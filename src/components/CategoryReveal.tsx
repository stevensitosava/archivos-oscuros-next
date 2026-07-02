"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CATEGORIES, type Category } from "../types";
import Sigil from "./Sigil";

const MOTIF: Record<Category, Parameters<typeof Sigil>[0]["motif"]> = {
  estoicismo: "moon",
  guerreros: "skull",
  historia: "key",
  filosofia: "eye",
};

const DEFAULT_NAME = "DISCIPLINA";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** One stacked name whose letters clip-reveal (slide up) from the center outward. */
function RevealName({
  text,
  shown,
  color,
  reduce,
}: {
  text: string;
  shown: boolean;
  color: string;
  reduce: boolean | null;
}) {
  const chars = Array.from(text);
  const center = (chars.length - 1) / 2;
  return (
    <h2
      className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-garamond uppercase leading-none"
      style={{ color, letterSpacing: "-0.01em" }}
      aria-hidden={!shown}
    >
      {chars.map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden" style={{ height: "1.12em" }}>
          <motion.span
            className="inline-block"
            initial={false}
            animate={{ y: shown ? "0%" : "130%", opacity: shown ? 1 : 0 }}
            transition={{
              y: {
                duration: reduce ? 0 : 0.7,
                ease: EASE,
                delay: reduce ? 0 : Math.abs(i - center) * 0.03,
              },
              // opacity gates the hidden names off entirely so no stray colour
              // (e.g. a letter apex) can peek past the clip box when idle.
              opacity: { duration: reduce ? 0 : shown ? 0.15 : 0.3 },
            }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}

/**
 * Interactive disciplines — ported from the awwwards "interactive team section"
 * (hover/18). A row of sigil thumbnails that grow on hover, each revealing its
 * discipline name in giant Garamond (letters staggered from center). Idle shows
 * "DISCIPLINA". Click a thumbnail → that category in the catalog.
 */
export default function CategoryReveal() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow mb-8 text-center">Cuatro frentes</p>

      {/* Giant name stage */}
      <div
        className="relative mx-auto select-none text-center"
        style={{ fontSize: "clamp(2.4rem, 13vw, 11rem)", height: "1.12em" }}
      >
        <RevealName text={DEFAULT_NAME} shown={active === null} color="var(--color-bone-50)" reduce={reduce} />
        {CATEGORIES.map((cat, i) => (
          <RevealName
            key={cat.slug}
            text={cat.label.toUpperCase()}
            shown={active === i}
            color="var(--color-ember-400)"
            reduce={reduce}
          />
        ))}
      </div>

      {/* Thumbnail row */}
      <div className="mt-12 flex flex-wrap items-start justify-center gap-6 sm:gap-10">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/catalogo?cat=${cat.slug}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="group flex flex-col items-center gap-3"
            aria-label={`${cat.label} — ${cat.blurb}`}
          >
            <motion.span
              className="grid place-items-center rounded-lg border border-bone-100/15 bg-ink-850 text-bone-200 transition-colors group-hover:border-bone-100/40 group-hover:text-bone-50"
              animate={{ width: active === i ? 132 : 84, height: active === i ? 132 : 84 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sigil motif={MOTIF[cat.slug]} className="w-1/2" weight={1.5} />
            </motion.span>
            <span
              className="text-[0.72rem] uppercase tracking-[0.18em] text-ash-400 transition-colors group-hover:text-bone-100"
              style={{ fontFamily: "var(--font-ritual)" }}
            >
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
