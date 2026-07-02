"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Book } from "@/types";
import { useCart } from "@/store/cart";
import { useEntitlements } from "@/components/EntitlementsProvider";
import { trackEvent } from "@/lib/analytics";
import Price from "@/components/Price";
import SaleCountdown from "@/components/SaleCountdown";
import AddToCartButton from "@/components/AddToCartButton";

export default function BuyActions({ book }: { book: Book }) {
  const router = useRouter();
  const { add, has } = useCart();
  const { owns } = useEntitlements();

  const buyNow = () => {
    if (!has(book.id)) {
      trackEvent("add_to_cart", { book: book.id, title: book.title, priceCents: book.priceCents, source: "buy_now" });
    }
    add(book.id);
    router.push("/checkout");
  };

  const isFree = book.priceCents <= 0;

  // Free book (not owned) → add to cart (no "Comprar ahora"); download from the cart.
  if (isFree && !owns(book.id)) {
    return (
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <Price cents={book.priceCents} currency={book.currency} className="text-[2.4rem] leading-none" />
        <AddToCartButton bookId={book.id} size="lg" />
      </div>
    );
  }

  // Already owned → download / library, never a second purchase.
  if (owns(book.id)) {
    return (
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <span
          className="text-[0.9rem] uppercase tracking-[0.18em] text-gold-300"
          style={{ fontFamily: "var(--font-ritual)" }}
        >
          ✓ Ya es tuyo
        </span>
        <a
          href={`/api/download?book=${book.id}`}
          target="_blank"
          rel="noopener"
          className="btn btn-ember px-7 py-4 text-[0.85rem]"
        >
          Descargar
        </a>
        <Link href="/biblioteca" className="btn btn-ghost px-7 py-4 text-[0.85rem]">
          Mi biblioteca
        </Link>
      </div>
    );
  }

  const onSale = typeof book.originalPriceCents === "number" && book.originalPriceCents > book.priceCents;

  return (
    <div className="mt-10">
      {onSale && book.saleEndsAt && (
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-ember-500/40 bg-ember-500/10 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.16em] text-ember-300"
          style={{ fontFamily: "var(--font-ritual)" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember-500" aria-hidden="true" />
          Oferta relámpago · <SaleCountdown endsAt={book.saleEndsAt} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-5">
        <Price
          cents={book.priceCents}
          originalCents={book.originalPriceCents}
          currency={book.currency}
          className="text-[2.4rem] leading-none"
        />
        <div className="flex flex-wrap items-center gap-3.5">
          <AddToCartButton bookId={book.id} size="lg" />
          <button type="button" onClick={buyNow} className="btn btn-ghost px-7 py-4 text-[0.85rem]">
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
