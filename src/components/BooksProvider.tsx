"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Book } from "@/types";

/* Holds the published catalog for client components (cart, checkout,
   catalog filtering, library) — seeded server-side in the root layout so
   the data is no longer bundled at build time. ~dozens of books, tiny. */
const Ctx = createContext<Book[]>([]);

export function BooksProvider({ books, children }: { books: Book[]; children: ReactNode }) {
  return <Ctx.Provider value={books}>{children}</Ctx.Provider>;
}

export function useBooks(): Book[] {
  return useContext(Ctx);
}

export function useBookById(id: string): Book | undefined {
  return useContext(Ctx).find((b) => b.id === id);
}
