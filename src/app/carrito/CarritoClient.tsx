"use client";

import Link from "next/link";
import type { Book } from "@/types";
import { useCart } from "@/store/cart";
import { findById } from "@/data/books";
import { paidTotal, nextBundleHint, offerLabel } from "@/data/bundles";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { useBooks } from "@/components/BooksProvider";
import ProceduralCover from "@/components/ProceduralCover";
import Price from "@/components/Price";
import FreeDownloadButton from "@/components/FreeDownloadButton";
import Sigil from "@/components/Sigil";

export default function CarritoClient() {
  const { lines, remove, clear } = useCart();
  const allBooks = useBooks();

  const books = lines
    .map((line) => findById(allBooks, line.bookId))
    .filter((b): b is Book => Boolean(b));

  /* ───────────────── Empty state ───────────────── */
  if (books.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="panel mx-auto max-w-md animate-rise p-12 text-center">
          <Sigil motif="candle" className="mx-auto w-12 text-gold-400" weight={1.6} />
          <h1 className="mt-6 text-[clamp(1.8rem,3vw,2.4rem)]">Tu carrito está vacío.</h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ash-400">
            Aún no has elegido ningún título. Hay volúmenes esperando a la luz de
            una vela — escoge el tuyo.
          </p>
          <Link href="/catalogo" className="btn btn-ember mt-8">
            Explorar el catálogo
          </Link>
        </div>
      </section>
    );
  }

  /* ───────────────── Non-empty ───────────────── */
  const paid = books.filter((b) => b.priceCents > 0);
  const { total, fullPrice, bundle, savings } = paidTotal(paid);
  const hint = nextBundleHint(paid.length);
  const currency = books[0]?.currency ?? "EUR";

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="eyebrow mb-3">Archivos Oscuros</p>
      <h1 className="text-[clamp(2.2rem,4vw,3.2rem)]">Tu carrito</h1>
      <p className="meta mt-2">
        {books.length} {books.length === 1 ? "título" : "títulos"}
      </p>

      {/* grid-cols-1 (minmax(0,1fr)) is load-bearing: without it the implicit
          auto track sizes to the longest title's max-content and pushes the
          prices off-screen on mobile. */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] lg:items-start">
        {/* ── Line items ── */}
        <ul className="flex min-w-0 flex-col gap-4">
          {books.map((book) => (
            <li key={book.id} className="panel flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
              <Link
                href={`/libro/${book.slug}`}
                className="block w-16 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
              >
                <ProceduralCover book={book} className="w-16" hideCode />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/libro/${book.slug}`}
                  className="block truncate text-[1.25rem] leading-tight text-bone-50 transition-colors hover:text-gold-300"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {book.title}
                </Link>
                <p className="mt-0.5 truncate text-[0.95rem] italic text-ash-400">{book.author}</p>
                <p className="meta mt-1.5">{book.formats.join(" · ")}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <Price cents={book.priceCents} originalCents={book.originalPriceCents} currency={book.currency} className="text-lg" />
                {book.priceCents <= 0 && (
                  <FreeDownloadButton book={book} size="sm" redirectTo="/carrito" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("remove_from_cart", { book: book.id, title: book.title });
                    remove(book.id);
                  }}
                  aria-label={`Quitar ${book.title} del carrito`}
                  className="group flex items-center gap-1.5 py-2 -my-2 text-[0.72rem] uppercase tracking-[0.16em] text-ash-500 transition-colors hover:text-ember-400"
                  style={{ fontFamily: "var(--font-ritual)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-3.5" aria-hidden="true">
                    <path d="M6 6 18 18 M18 6 6 18" />
                  </svg>
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* ── Summary ── */}
        <aside className="panel min-w-0 p-6 sm:p-7 lg:sticky lg:top-24">
          <h2 className="text-[1.6rem]" style={{ fontFamily: "var(--font-display)" }}>Resumen</h2>
          <hr className="gold-rule my-5" />

          <div className="flex items-center justify-between">
            <span className="text-[0.98rem] text-bone-200/80">Subtotal</span>
            <Price cents={fullPrice} currency={currency} className="text-base" />
          </div>
          {bundle && (
            <div className="mt-2.5 flex items-center justify-between text-ember-300">
              <span className="text-[0.9rem]">{offerLabel(paid.length, bundle)} · {paid.length} libros</span>
              <span className="font-mono text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                −{formatPrice(savings, currency)}
              </span>
            </div>
          )}
          <p className="meta mt-2">IVA incluido · Entrega digital</p>

          {hint && (
            <p className="mt-4 flex items-center gap-2 rounded-md border border-ember-500/25 bg-ember-500/[0.06] px-3.5 py-2.5 text-[0.8rem] leading-snug text-ember-200/90">
              <Sigil motif="key" className="w-3.5 shrink-0 text-ember-400" weight={1.8} />
              <span>
                Añade {hint.needed} {hint.needed === 1 ? "libro" : "libros"} más y llévate «{hint.tier.label}» por{" "}
                {formatPrice(hint.tier.priceCents, currency)}.
              </span>
            </p>
          )}

          <hr className="gold-rule my-5" />

          <div className="flex items-baseline justify-between">
            <span className="text-[0.78rem] uppercase tracking-[0.18em] text-gold-400" style={{ fontFamily: "var(--font-ritual)" }}>Total</span>
            <Price cents={total} currency={currency} className="text-2xl" />
          </div>

          <Link href="/checkout" className="btn btn-ember mt-7 w-full">Tramitar compra</Link>

          <button
            type="button"
            onClick={clear}
            className="mt-3 inline-flex w-full items-center justify-center py-2.5 -my-2.5 text-center text-[0.72rem] uppercase tracking-[0.16em] text-ash-500 transition-colors hover:text-ember-400"
            style={{ fontFamily: "var(--font-ritual)" }}
          >
            Vaciar carrito
          </button>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[0.78rem] leading-relaxed text-ash-500">
            <Sigil motif="key" className="w-3.5 shrink-0 text-gold-500" weight={1.8} />
            Pago cifrado con Stripe. Descarga inmediata al confirmar.
          </p>
        </aside>
      </div>
    </section>
  );
}
