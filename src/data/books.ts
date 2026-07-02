import type { Book, Category } from "../types";

/* ============================================================
   PURE catalog transforms. These take the book list as input so
   they run anywhere (server pages pass `await getAllBooks()`,
   client components pass the list from <BooksProvider>). Server-only
   DB reads live in src/lib/books-data.ts.
   ============================================================ */

export function findBySlug(books: Book[], slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export function findById(books: Book[], id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

/** Free books (price 0) — surfaced on /gratis. */
export function freeBooks(books: Book[]): Book[] {
  return books.filter((b) => b.priceCents <= 0);
}

/** Featured books for the home rail (falls back to first 6). */
export function featuredBooks(books: Book[]): Book[] {
  const flagged = books.filter((b) => b.featured);
  return flagged.length ? flagged : books.slice(0, 6);
}

export function byCategory(books: Book[], category: Category): Book[] {
  return books.filter((b) => b.category === category);
}

/** "More like this" — same category, excluding the current book. */
export function relatedTo(books: Book[], book: Book, limit = 4): Book[] {
  return books.filter((b) => b.category === book.category && b.id !== book.id).slice(0, limit);
}

/** Free-text search across title, author, tagline, tags. */
export function searchBooks(books: Book[], query: string): Book[] {
  const q = query.trim().toLowerCase();
  if (!q) return books;
  return books.filter((b) =>
    [b.title, b.author, b.tagline, ...b.tags].join(" ").toLowerCase().includes(q),
  );
}

export type SortKey = "destacados" | "precio-asc" | "precio-desc" | "valoracion" | "recientes";

export function sortBooks(books: Book[], key: SortKey): Book[] {
  const copy = [...books];
  switch (key) {
    case "precio-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "precio-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "valoracion":
      return copy.sort((a, b) => b.rating - a.rating);
    case "recientes":
      return copy.sort((a, b) => b.year - a.year);
    case "destacados":
    default:
      return copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}
