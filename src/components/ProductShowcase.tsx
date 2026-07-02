"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Book } from "../types";
import { useCart } from "../store/cart";
import { useEntitlements } from "./EntitlementsProvider";
import Price from "./Price";

const EASE: [number, number, number, number] = [0.5, 0, 0.2, 1];
const CLONES = 5;

interface Clone {
  key: number;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
}

/**
 * Add-to-cart flight — ported from the awwwards "add-to-cart" (grid/6) demo.
 * Clicking "Añadir al carrito" recedes the other covers, scales up the chosen one,
 * and sends a staggered cascade of cover copies flying into the nav cart icon, then
 * restores the grid and bumps the cart count. Reduced-motion adds instantly.
 */
export default function ProductShowcase({ books }: { books: Book[] }) {
  const reduce = useReducedMotion();
  const { has, add } = useCart();
  const { owns } = useEntitlements();
  const [adding, setAdding] = useState<number | null>(null);
  const [clones, setClones] = useState<Clone[]>([]);
  const coverRefs = useRef<(HTMLImageElement | null)[]>([]);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);

  const fly = (i: number, book: Book) => {
    if (adding !== null) return; // one flight at a time
    const src = book.cover.image;
    if (reduce || !src) {
      add(book.id);
      return;
    }
    const img = coverRefs.current[i];
    const targetEl = document.querySelector("[data-cart-fly-target]");
    if (!img || !targetEl) {
      add(book.id);
      return;
    }

    const r = img.getBoundingClientRect();
    const t = targetEl.getBoundingClientRect();
    const dx = t.x + t.width / 2 - (r.x + r.width / 2);
    const dy = t.y + t.height / 2 - (r.y + r.height / 2);

    const batch: Clone[] = Array.from({ length: CLONES }, () => ({
      key: ++seq.current,
      src,
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      dx,
      dy,
    }));

    setAdding(i);
    setClones(batch);

    timers.current.push(window.setTimeout(() => add(book.id), 650));
    timers.current.push(
      window.setTimeout(() => {
        setClones([]);
        setAdding(null);
      }, 1400),
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {books.map((book, i) => {
          const dimmed = adding !== null && adding !== i;
          const grown = adding === i;
          const inCart = has(book.id);
          const owned = owns(book.id);
          return (
            <motion.div
              key={book.id}
              animate={{
                scale: grown ? 1.05 : dimmed ? 0.85 : 1,
                opacity: dimmed ? 0.08 : 1,
              }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <Link href={`/libro/${book.slug}`} className="block aspect-[2/3] overflow-hidden rounded-md bg-ink-800">
                <img
                  ref={(el) => {
                    coverRefs.current[i] = el;
                  }}
                  src={book.cover.image}
                  alt={`Portada de ${book.title}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              </Link>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-garamond text-[1rem] leading-tight text-bone-50">{book.title}</h3>
                  <p className="truncate text-[0.74rem] italic text-ash-400">{book.author}</p>
                  <Price cents={book.priceCents} originalCents={book.originalPriceCents} currency={book.currency} className="mt-1 block text-[0.9rem]" />
                </div>
                {owned ? (
                  <Link
                    href="/biblioteca"
                    className="shrink-0 rounded-full border border-gold-500/40 px-3.5 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-gold-300 transition-colors hover:border-gold-400/70"
                    style={{ fontFamily: "var(--font-ritual)" }}
                    aria-label={`${book.title} — en tu biblioteca`}
                  >
                    Comprado
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => fly(i, book)}
                    disabled={adding !== null}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
                      inCart
                        ? "border border-bone-100/25 text-bone-200"
                        : "bg-bone-50 text-ink-950 hover:bg-white"
                    }`}
                    style={{ fontFamily: "var(--font-ritual)" }}
                    aria-label={inCart ? `${book.title} en el carrito` : `Añadir ${book.title} al carrito`}
                  >
                    {inCart ? "✓" : "Añadir"}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Flying cover clones (fixed, viewport-relative) */}
      {clones.map((c, idx) => (
        <motion.img
          key={c.key}
          src={c.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed z-[100] rounded-md object-cover shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]"
          style={{ top: c.y, left: c.x, width: c.w, height: c.h }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: [0, c.dx * 0.15, c.dx],
            y: [0, -46, c.dy],
            scale: [1, 0.5, 0.04],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.95, ease: EASE, times: [0, 0.4, 1], delay: idx * 0.08 }}
        />
      ))}
    </>
  );
}
