"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BUNDLE_TIERS } from "@/data/bundles";
import { formatPrice } from "@/lib/format";
import { useBooks } from "@/components/BooksProvider";
import { useCart } from "@/store/cart";
import { useEntitlements } from "@/components/EntitlementsProvider";
import { trackEvent } from "@/lib/analytics";
import ProceduralCover from "@/components/ProceduralCover";
import Sigil from "@/components/Sigil";

/* ============================================================
   Offer showcase. Reads the same BUNDLE_TIERS the cart/checkout/
   Stripe charge use, so the advertised numbers can never drift
   from what's charged. Two variants:
   - "full"  — hero-style panel with the cover fan + tier cards
               (home, catálogo)
   - "strip" — one-line banner + quick CTA (book detail pages)
   ============================================================ */

function useOffer() {
  const books = useBooks();
  const { ids, add } = useCart();
  const { owns } = useEntitlements();
  const paid = useMemo(
    () => books.filter((b) => b.priceCents > 0).sort((a, b) => a.priceCents - b.priceCents),
    [books],
  );
  const tiers = useMemo(() => [...BUNDLE_TIERS].sort((a, b) => a.minBooks - b.minBooks), []);
  // Never (re-)add books the user already owns — checkout drops them server-side
  // anyway, and a cart total that differs from the charge erodes trust.
  const missing = paid.filter((b) => !owns(b.id));
  const ownsAll = paid.length > 0 && missing.length === 0;
  const allInCart = !ownsAll && missing.every((b) => ids.has(b.id));
  const addAll = () => {
    const fresh = missing.filter((b) => !ids.has(b.id));
    if (fresh.length) trackEvent("add_pack", { books: fresh.length });
    missing.forEach((b) => add(b.id));
  };
  /** One-tap "add the pack" only makes sense while the catalog has EXACTLY the
   *  top tier's count of paid titles — beyond that the user picks their 5. */
  const topTier = tiers[tiers.length - 1];
  const quickAddAll = paid.length === topTier.minBooks;
  /** Compare price: the N cheapest paid titles at their REGULAR price. Uses the
   *  pre-sale price so a short flash sale on one title doesn't make the standing
   *  bundle discount look weak. */
  const compareFor = (n: number) =>
    paid.slice(0, Math.min(n, paid.length)).reduce((s, b) => s + (b.originalPriceCents ?? b.priceCents), 0);
  return { paid, tiers, ownsAll, allInCart, addAll, quickAddAll, compareFor };
}

function SavingsBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <span className="rounded-full bg-ember-500 px-2.5 py-1 text-[0.72rem] font-bold leading-none text-white shadow-[0_2px_12px_rgba(178,52,42,0.5)]">
      −{pct}%
    </span>
  );
}

/* ───────────────────────── full ───────────────────────── */

function FullPromo() {
  const router = useRouter();
  const { paid, tiers, ownsAll, allInCart, addAll, quickAddAll, compareFor } = useOffer();
  const [added, setAdded] = useState(false);
  if (paid.length < 3) return null;

  const handleAddAll = () => {
    if (ownsAll) {
      router.push("/biblioteca");
      return;
    }
    if (allInCart) {
      router.push("/carrito");
      return;
    }
    addAll();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="panel relative overflow-hidden">
      {/* ember glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(90% 120% at 85% -10%, rgba(178,52,42,0.16), transparent 60%)" }}
      />

      <div className="relative grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        {/* ── Left: fan of covers + pitch ── */}
        <div className="min-w-0">
          <div className="flex items-end" aria-hidden="true">
            {paid.slice(0, 5).map((b, i, arr) => (
              <div
                key={b.id}
                className={`w-[19%] shrink-0 transition-transform duration-500 ${i > 0 ? "-ml-[6%]" : ""}`}
                style={{
                  transform: `rotate(${(i - (arr.length - 1) / 2) * 3.2}deg) translateY(${Math.abs(i - (arr.length - 1) / 2) * 6}px)`,
                  zIndex: 10 - Math.abs(i - (arr.length - 1) / 2),
                }}
              >
                <ProceduralCover book={b} hideCode className="shadow-[0_14px_36px_rgba(0,0,0,0.55)]" />
              </div>
            ))}
          </div>

          <p className="eyebrow mb-2 mt-7">Ofertas del archivo</p>
          <h2 className="text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight text-bone-50">
            Llévate más, <span className="text-ember-300">paga menos</span>.
          </h2>
          <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ash-400">
            Combina los títulos que quieras — el descuento se aplica solo en el carrito, sin códigos.
          </p>
        </div>

        {/* ── Right: tier cards ── */}
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          {tiers.map((t, i) => {
            const compare = compareFor(t.minBooks);
            const pct = compare > 0 ? Math.round((1 - t.priceCents / compare) * 100) : 0;
            const isCollection = i === tiers.length - 1;
            return (
              <div
                key={t.minBooks}
                className={`flex min-w-0 flex-col rounded-xl border p-5 ${
                  isCollection
                    ? "border-ember-500/45 bg-gradient-to-b from-ember-500/[0.14] to-transparent"
                    : "border-bone-100/12 bg-ink-800/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="text-[0.7rem] uppercase tracking-[0.18em] text-ash-400"
                    style={{ fontFamily: "var(--font-ritual)" }}
                  >
                    {t.label}
                  </p>
                  <SavingsBadge pct={pct} />
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5">
                  <span
                    className="text-[1.9rem] font-semibold leading-none text-gold-300 tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatPrice(t.priceCents)}
                  </span>
                  {compare > t.priceCents && (
                    <span className="text-[0.95rem] text-ash-500 line-through tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
                      {formatPrice(compare)}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-[0.85rem] leading-snug text-ash-400">
                  {isCollection
                    ? `${t.minBooks} títulos a tu elección — el mejor precio por libro.`
                    : `Elige ${t.minBooks} títulos cualesquiera del catálogo.`}
                </p>

                <div className="mt-auto pt-4">
                  {isCollection && quickAddAll ? (
                    <button
                      type="button"
                      onClick={handleAddAll}
                      className="btn btn-ember w-full !px-4 !py-3 !text-[0.7rem]"
                    >
                      {ownsAll
                        ? "Ya es tuyo — Biblioteca"
                        : added
                          ? "✓ Añadido"
                          : allInCart
                            ? "Ir al carrito"
                            : `Añadir los ${t.minBooks} al carrito`}
                    </button>
                  ) : isCollection ? (
                    <Link href="/catalogo" className="btn btn-ember w-full !px-4 !py-3 !text-[0.7rem]">
                      Elegir mis {t.minBooks}
                    </Link>
                  ) : (
                    <Link href="/catalogo" className="btn btn-ghost w-full !px-4 !py-3 !text-[0.7rem]">
                      Elegir títulos
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── strip ───────────────────────── */

function StripPromo() {
  const router = useRouter();
  const { paid, tiers, ownsAll, allInCart, addAll, quickAddAll } = useOffer();
  const [added, setAdded] = useState(false);
  if (paid.length < 3) return null;

  const summary = tiers
    .map((t) => `${t.minBooks} por ${formatPrice(t.priceCents)}`)
    .join(" · ");

  const handle = () => {
    if (ownsAll) {
      router.push("/biblioteca");
      return;
    }
    if (allInCart) {
      router.push("/carrito");
      return;
    }
    addAll();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-6 flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-xl border border-ember-500/30 bg-ember-500/[0.07] px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Sigil motif="key" className="w-4 shrink-0 text-ember-400" weight={1.7} />
        <p className="text-[0.88rem] leading-snug text-bone-200">
          <span className="font-semibold text-ember-300">Ofertas:</span> {summary}
          <span className="text-ash-400"> — descuento automático en el carrito.</span>
        </p>
      </div>
      {quickAddAll ? (
        <button
          type="button"
          onClick={handle}
          className="btn btn-ghost shrink-0 !px-4 !py-2.5 !text-[0.66rem]"
        >
          {ownsAll ? "Ya es tuyo" : added ? "✓ Añadido" : allInCart ? "Ir al carrito" : "Añadir el pack de 5"}
        </button>
      ) : (
        <Link href="/catalogo" className="btn btn-ghost shrink-0 !px-4 !py-2.5 !text-[0.66rem]">
          Ver el catálogo
        </Link>
      )}
    </div>
  );
}

export default function BundlePromo({ variant = "full" }: { variant?: "full" | "strip" }) {
  return variant === "strip" ? <StripPromo /> : <FullPromo />;
}
