"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Book } from "@/types";
import { useCart } from "@/store/cart";
import { findById } from "@/data/books";
import { useBooks } from "@/components/BooksProvider";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/env";
import { grantDemoOwnership } from "@/lib/demo-library";
import { paidTotal, nextBundleHint, offerLabel } from "@/data/bundles";
import { formatMoney, isLocal } from "@/lib/money";
import { useLocale } from "@/components/LocaleProvider";
import { trackEvent } from "@/lib/analytics";
import { confirmDevPurchase } from "./actions";
import Price from "@/components/Price";
import Sigil from "@/components/Sigil";

export default function CheckoutClient() {
  const router = useRouter();
  const { lines } = useCart();
  const allBooks = useBooks();
  const loc = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const books = lines
    .map((l) => findById(allBooks, l.bookId))
    .filter((b): b is Book => Boolean(b));
  const paid = books.filter((b) => b.priceCents > 0);
  const { total, bundle, savings } = paidTotal(paid);
  const hint = nextBundleHint(paid.length);
  const currency = books[0]?.currency ?? "EUR";

  if (books.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <Sigil motif="candle" className="w-12 text-gold-400" weight={1.5} />
        <h1 className="mt-6 text-[clamp(1.8rem,3vw,2.4rem)]">No hay nada que pagar</h1>
        <p className="mt-3 text-ash-400">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="btn btn-ember mt-8">Explorar el catálogo</Link>
      </section>
    );
  }

  const pay = async () => {
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }
    setBusy(true);
    setError(null);
    trackEvent("checkout_started", { items: books.length, valueCents: total });
    try {
      const ids = books.map((b) => b.id);

      if (isStripeConfigured) {
        // Real checkout — handed off to the Stripe route (built in the Stripe step).
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookIds: ids, marketingConsent: marketing }),
        });
        const body = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !body.url) throw new Error(body.error ?? "No se pudo iniciar el pago.");
        window.location.href = body.url;
        return;
      }

      if (isSupabaseConfigured) {
        // DB connected, Stripe not yet: grant a real DB entitlement (needs sign-in).
        const res = await confirmDevPurchase(ids, marketing);
        if (!res.ok) {
          if (res.error === "signin") {
            router.push("/acceso?redirect_url=/checkout");
            return;
          }
          throw new Error("El pago aún no está disponible. Conecta Stripe para comprar.");
        }
        // The success page empties the cart — clearing here first would flash
        // the "No hay nada que pagar" empty state during the navigation.
        router.push("/compra/exito");
        return;
      }

      // Full demo (no backend) — grant ownership locally and confirm.
      grantDemoOwnership(ids);
      router.push("/compra/exito");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar el pago.");
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl px-5 py-20 sm:px-8">
      <p className="eyebrow mb-3">Pago</p>
      <h1 className="text-[clamp(2rem,4vw,3rem)]">Tramitar compra</h1>

      <ul className="panel mt-10 divide-y divide-bone-100/10">
        {books.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="min-w-0 truncate text-bone-100">{b.title}</span>
            <Price cents={b.priceCents} originalCents={b.originalPriceCents} currency={b.currency} className="shrink-0 text-base" />
          </li>
        ))}
        {bundle && (
          <li className="flex items-center justify-between gap-4 px-5 py-3 text-ember-300">
            <span className="min-w-0 truncate text-[0.92rem]">
              {offerLabel(paid.length, bundle)} · {paid.length} libros
            </span>
            <span className="shrink-0 font-mono text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              −{formatMoney(savings, loc)}
            </span>
          </li>
        )}
        <li className="flex items-center justify-between px-5 py-4">
          <span className="text-[0.78rem] uppercase tracking-[0.18em] text-gold-400" style={{ fontFamily: "var(--font-ritual)" }}>
            Total
          </span>
          <Price cents={total} currency={currency} className="text-2xl" />
        </li>
      </ul>

      {isLocal(loc) && (
        <p className="mt-3 text-[0.8rem] text-ash-500">
          Precios mostrados en tu moneda ({loc.currency}). El pago se procesa de forma segura y se convierte automáticamente en el checkout.
        </p>
      )}

      {hint && (
        <p className="mt-3 flex items-center gap-2 rounded-md border border-ember-500/25 bg-ember-500/[0.06] px-4 py-2.5 text-[0.82rem] leading-snug text-ember-200/90">
          <Sigil motif="key" className="w-3.5 shrink-0 text-ember-400" weight={1.8} />
          Añade {hint.needed} {hint.needed === 1 ? "libro" : "libros"} más y llévate «{hint.tier.label}» por{" "}
          {formatMoney(hint.tier.priceCents, loc)}.
        </p>
      )}

      {/* Consent — terms required to purchase; marketing is the user's choice. */}
      <div className="mt-6 space-y-2.5">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-bone-100"
          />
          <span className="text-[0.82rem] leading-snug text-ash-400">
            Acepto los{" "}
            <Link href="/terminos" className="text-bone-200 underline underline-offset-2 hover:text-gold-300">
              términos y condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacidad" className="text-bone-200 underline underline-offset-2 hover:text-gold-300">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-bone-100"
          />
          <span className="text-[0.82rem] leading-snug text-ash-400">
            Quiero recibir novedades y publicidad de Archivos Oscuros por correo.
          </span>
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-ember-400">{error}</p>}

      <button
        type="button"
        onClick={pay}
        disabled={busy || !acceptTerms}
        className="btn btn-ember mt-7 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Procesando…" : isStripeConfigured ? "Pagar" : "Confirmar compra (demo)"}
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.78rem] leading-relaxed text-ash-500">
        <Sigil motif="key" className="w-3.5 shrink-0 text-gold-500" weight={1.8} />
        {isStripeConfigured
          ? "Pago cifrado con Stripe. Descarga inmediata al confirmar."
          : "Modo demo: la compra se simula y el libro queda en tu Biblioteca."}
      </p>
    </section>
  );
}
