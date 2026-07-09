"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { Book } from "@/types";
import { useCart } from "@/store/cart";
import { useLocale } from "@/components/LocaleProvider";
import { formatMoney } from "@/lib/money";
import { trackEvent } from "@/lib/analytics";

/**
 * "Look inside" modal — the zero-friction micro-conversion for cold visitors.
 * Pages come from /public/samples/{slug}/{n}.webp (see the extraction script in
 * the repo history); `pages` is the count from src/data/samples.json. The last
 * page pitches the buy with the geo-localized price. Paid books only — free
 * books already have a stronger CTA (download the whole thing).
 */
export default function SamplePreview({ book, pages }: { book: Book; pages: number }) {
  const [open, setOpen] = useState(false);
  // Portal target exists only after mount (SSR renders just the trigger button).
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, has } = useCart();
  const loc = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const src = (n: number) => `/samples/${book.slug}/${n}.webp`;
  const last = page === pages;

  const show = () => {
    setPage(1);
    setOpen(true);
    trackEvent("sample_opened", { book: book.id, title: book.title });
  };

  const next = useCallback(() => {
    setPage((p) => {
      const n = Math.min(pages, p + 1);
      if (n === pages && p !== pages) trackEvent("sample_completed", { book: book.id });
      return n;
    });
  }, [pages, book.id]);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);

  // Scroll lock + keyboard while open. position:fixed (not overflow:hidden) —
  // overflow alone doesn't stop touch-drag on iOS Safari (same pattern as Nav).
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prevStyles = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      Object.assign(style, prevStyles);
      window.removeEventListener("keydown", onKey);
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open, next, prev]);

  const inCart = has(book.id);
  const addToCart = () => {
    if (!inCart) {
      trackEvent("add_to_cart", { book: book.id, title: book.title, priceCents: book.priceCents, source: "sample" });
      add(book.id);
    }
    setAdded(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="mt-4 inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.16em] text-gold-400/90 transition-colors hover:text-gold-300"
        style={{ fontFamily: "var(--font-ritual)" }}
      >
        <BookOpen size={15} strokeWidth={1.6} aria-hidden="true" />
        Lee las primeras páginas
      </button>

      {/* Portaled to <body>: the detail column has animate-rise (fill-mode both
          keeps a transform applied), which would otherwise become the containing
          block for position:fixed and trap the "fullscreen" modal inside it. */}
      {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Vista previa de ${book.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="min-w-0 truncate text-[0.82rem] uppercase tracking-[0.16em] text-white/70" style={{ fontFamily: "var(--font-ritual)" }}>
                {book.title} — vista previa
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[0.8rem] tabular-nums text-white/60" style={{ fontFamily: "var(--font-mono)" }}>
                  {page} / {pages}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar vista previa"
                  className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} strokeWidth={1.6} />
                </button>
              </div>
            </div>

            {/* Page */}
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-12 pb-3 sm:px-16"
              onTouchStart={(e) => {
                // Single-finger swipes only — a pinch-zoom must never flip pages.
                touch.current = e.touches.length === 1
                  ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                  : null;
              }}
              onTouchEnd={(e) => {
                if (!touch.current || e.touches.length > 0) return;
                const dx = e.changedTouches[0].clientX - touch.current.x;
                const dy = e.changedTouches[0].clientY - touch.current.y;
                touch.current = null;
                if (Math.abs(dx) <= Math.abs(dy)) return; // vertical gesture — ignore
                if (dx < -40) next();
                if (dx > 40) prev();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={page}
                src={src(page)}
                alt={`Página ${page} de ${book.title}`}
                className="max-h-full max-w-full rounded-md shadow-[0_20px_70px_rgba(0,0,0,0.8)]"
              />
              {/* Preload the next page so advancing feels instant. */}
              {page < pages && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src(page + 1)} alt="" aria-hidden="true" className="hidden" />
              )}

              <button
                type="button"
                onClick={prev}
                disabled={page === 1}
                aria-label="Página anterior"
                className="absolute left-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25 sm:left-4"
              >
                <ChevronLeft size={26} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={last}
                aria-label="Página siguiente"
                className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25 sm:right-4"
              >
                <ChevronRight size={26} strokeWidth={1.6} />
              </button>
            </div>

            {/* Bottom bar — buy pitch appears on the last page */}
            <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-1 sm:px-6">
              {last ? (
                <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2.5 rounded-xl border border-ember-500/35 bg-ink-900/90 px-5 py-3.5">
                  <p className="text-[0.92rem] text-bone-100">
                    ¿Te atrapó? El libro completo — <span className="font-semibold text-gold-300">{formatMoney(book.priceCents, loc)}</span>
                  </p>
                  {added || inCart ? (
                    <Link href="/carrito" className="btn btn-ember !px-5 !py-2.5 !text-[0.68rem]" onClick={() => setOpen(false)}>
                      Ir al carrito
                    </Link>
                  ) : (
                    <button type="button" onClick={addToCart} className="btn btn-ember !px-5 !py-2.5 !text-[0.68rem]">
                      Añadir al carrito
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-center text-[0.72rem] uppercase tracking-[0.16em] text-white/40" style={{ fontFamily: "var(--font-ritual)" }}>
                  Desliza o usa las flechas
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body)}
    </>
  );
}
