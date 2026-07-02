"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Book } from "@/types";
import { useCart } from "@/store/cart";
import { useBooks } from "@/components/BooksProvider";
import { findById } from "@/data/books";
import { paidTotal } from "@/data/bundles";
import { trackEvent } from "@/lib/analytics";
import Sigil from "@/components/Sigil";

export default function CompraExitoClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { lines, clear } = useCart();
  const allBooks = useBooks();
  const [confirming, setConfirming] = useState(Boolean(sessionId));

  // Snapshot the cart's value BEFORE it's cleared, so the purchase event carries
  // real numbers. Captured lazily on the first render where the cart is hydrated.
  const snapshot = useRef<{ items: number; valueCents: number } | null>(null);
  if (snapshot.current === null && lines.length > 0) {
    const books = lines.map((l) => findById(allBooks, l.bookId)).filter(Boolean) as Book[];
    const paid = books.filter((b) => b.priceCents > 0);
    snapshot.current = { items: books.length, valueCents: paidTotal(paid).total };
  }

  useEffect(() => {
    // No session id → free/demo path (already granted before redirect): safe to empty.
    if (!sessionId) {
      clear();
      return;
    }
    // Stripe path → confirm the session (fallback to the webhook), and only empty
    // the cart once the purchase is actually confirmed.
    let cancelled = false;
    (async () => {
      let ok = false;
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
        ok = Boolean(body.ok);
      } catch {
        /* the webhook is the durable path; leave the cart as-is */
      }
      if (!cancelled) {
        if (ok) {
          // Fire the conversion exactly once per order. localStorage (not
          // sessionStorage) is durable + cross-tab, so reopening the success URL
          // in a new tab won't re-fire; and we require a real snapshot so a
          // reopened, already-cleared cart never emits a 0-value purchase.
          const key = `ao_purchase_tracked_${sessionId}`;
          if (snapshot.current && !localStorage.getItem(key)) {
            localStorage.setItem(key, "1");
            trackEvent("purchase_completed", {
              items: snapshot.current.items,
              valueCents: snapshot.current.valueCents,
            });
          }
          clear();
        }
        setConfirming(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clear]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <Sigil motif="candle" className="w-12 text-gold-400" weight={1.5} />
      <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)]">Compra confirmada</h1>
      <p className="mt-5 text-ash-400">
        {confirming
          ? "Confirmando tu pago…"
          : "Gracias. Tus títulos están disponibles en tu Biblioteca."}
      </p>
      <Link href="/biblioteca" className="btn btn-ember mt-8">
        Ir a mi Biblioteca
      </Link>
    </section>
  );
}
