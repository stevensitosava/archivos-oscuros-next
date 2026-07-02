"use client";

import Link from "next/link";
import { useCart } from "../store/cart";
import { useEntitlements } from "./EntitlementsProvider";
import { useBookById } from "./BooksProvider";
import { trackEvent } from "@/lib/analytics";

interface AddToCartButtonProps {
  bookId: string;
  className?: string;
  /** Larger primary variant for the book-detail page. */
  size?: "sm" | "lg";
}

/**
 * Toggles a book in the cart — unless the user already OWNS it, in which case it
 * shows "Comprado" / "En tu biblioteca" (no second purchase possible).
 */
export default function AddToCartButton({ bookId, className = "", size = "sm" }: AddToCartButtonProps) {
  const { has, toggle } = useCart();
  const { owns } = useEntitlements();
  const book = useBookById(bookId);
  const inCart = has(bookId);

  // Toggle, emitting the matching funnel event for the direction of the change.
  const onToggle = () => {
    if (!inCart) {
      trackEvent("add_to_cart", { book: bookId, title: book?.title ?? bookId, priceCents: book?.priceCents ?? 0 });
    } else {
      trackEvent("remove_from_cart", { book: bookId, title: book?.title ?? bookId });
    }
    toggle(bookId);
  };

  // Already owned → link to the library instead of an add/buy control.
  if (owns(bookId)) {
    if (size === "lg") {
      return (
        <Link href="/biblioteca" className={`btn btn-ghost px-7 py-4 text-[0.85rem] ${className}`}>
          <CheckIcon /> En tu biblioteca
        </Link>
      );
    }
    return (
      <Link
        href="/biblioteca"
        aria-label="Comprado — en tu biblioteca"
        className={`shrink-0 rounded-full border border-gold-500/40 px-3.5 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-gold-300 transition-colors hover:border-gold-400/70 ${className}`}
        style={{ fontFamily: "var(--font-ritual)" }}
      >
        Comprado
      </Link>
    );
  }

  // Larger button for the book-detail page.
  if (size === "lg") {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={inCart}
        className={`btn ${inCart ? "btn-ghost" : "btn-ember"} px-7 py-4 text-[0.85rem] ${className}`}
      >
        {inCart ? (
          <>
            <CheckIcon /> En el carrito
          </>
        ) : (
          <>
            <PlusIcon /> Añadir
          </>
        )}
      </button>
    );
  }

  // Compact pill for cards.
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={inCart}
      aria-label={inCart ? "En el carrito" : "Añadir al carrito"}
      className={`shrink-0 rounded-full px-3.5 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] transition-colors ${
        inCart ? "border border-bone-100/25 text-bone-200" : "bg-bone-50 text-ink-950 hover:bg-white"
      } ${className}`}
      style={{ fontFamily: "var(--font-ritual)" }}
    >
      {inCart ? "✓" : "Añadir"}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
