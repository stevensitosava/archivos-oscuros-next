"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/types";

const STORAGE_KEY = "ao_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  /** Set of bookIds in the cart, for O(1) "in cart?" checks. */
  ids: Set<string>;
  count: number;
  add: (bookId: string) => void;
  remove: (bookId: string) => void;
  toggle: (bookId: string) => void;
  has: (bookId: string) => boolean;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed)
      ? parsed.filter((l) => l && typeof l.bookId === "string")
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Start empty on the server AND first client render to avoid a hydration
  // mismatch, then hydrate from localStorage after mount.
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(load());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage full / disabled — cart simply won't persist */
    }
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const ids = new Set(lines.map((l) => l.bookId));
    return {
      lines,
      ids,
      count: lines.length,
      has: (bookId) => ids.has(bookId),
      add: (bookId) =>
        setLines((prev) =>
          prev.some((l) => l.bookId === bookId) ? prev : [...prev, { bookId, qty: 1 }],
        ),
      remove: (bookId) => setLines((prev) => prev.filter((l) => l.bookId !== bookId)),
      toggle: (bookId) =>
        setLines((prev) =>
          prev.some((l) => l.bookId === bookId)
            ? prev.filter((l) => l.bookId !== bookId)
            : [...prev, { bookId, qty: 1 }],
        ),
      // Idempotent: keep the same reference when already empty so consumers
      // calling clear() inside an effect don't trigger a re-render loop.
      clear: () => setLines((prev) => (prev.length === 0 ? prev : [])),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
