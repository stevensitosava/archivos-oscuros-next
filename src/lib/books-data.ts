import "server-only";
import { unstable_cache } from "next/cache";
import { getServiceSupabase } from "./supabase-server";
import { BOOKS } from "@/data/catalog";
import { activeSale } from "@/data/sales";
import type { Book } from "@/types";

/* ============================================================
   Server-side book reads. The DB `books` table is the source of
   truth (managed from /admin); the storefront reads it through a
   tagged cache so edits show up instantly via revalidateTag(BOOKS_TAG).
   Falls back to the bundled TS catalog when there's no DB (demo
   mode) or if the query fails — so the site never goes blank.
   ============================================================ */

export const BOOKS_TAG = "books";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToBook(r: any): Book {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    author: r.author,
    category: r.category,
    tagline: r.tagline ?? "",
    synopsis: r.synopsis ?? "",
    priceCents: r.price_cents ?? 0,
    currency: (r.currency ?? "EUR") as Book["currency"],
    formats: (r.formats ?? []) as Book["formats"],
    pages: r.pages ?? 0,
    year: r.year ?? 2025,
    language: (r.language ?? "Español") as Book["language"],
    tags: r.tags ?? [],
    code: String(r.id).toUpperCase(),
    cover: {
      bg: r.cover_bg ?? "#171717",
      ink: r.cover_ink ?? "#ececee",
      motif: (r.cover_motif ?? "skull") as Book["cover"]["motif"],
      image: r.cover_image ?? undefined,
    },
    featured: Boolean(r.featured),
    rating: Number(r.rating ?? 0),
    stripePriceId: r.stripe_price_id ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchPublishedBooks(): Promise<Book[]> {
  const sb = getServiceSupabase();
  if (!sb) return BOOKS; // demo / no DB → bundled catalog
  const { data, error } = await sb
    .from("books")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) {
    if (error) console.warn("[books-data] falling back to TS catalog:", error.message);
    return BOOKS;
  }
  return data.map(rowToBook);
}

/** Overlay any active flash sale onto a book. Runs OUTSIDE the cache (per read)
 *  so the sale starts/ends exactly on schedule regardless of the 5-min row cache.
 *  Never discounts a free book. */
function applySale(book: Book): Book {
  if (book.priceCents <= 0) return book;
  const sale = activeSale(book.id);
  if (!sale || sale.salePriceCents >= book.priceCents) return book;
  return { ...book, priceCents: sale.salePriceCents, originalPriceCents: book.priceCents, saleEndsAt: sale.endsAt };
}

/** Raw published books (tagged cache — revalidated on admin edits). */
const cachedPublishedBooks = unstable_cache(fetchPublishedBooks, ["published-books"], {
  tags: [BOOKS_TAG],
  revalidate: 300,
});

/** All published books, with any active flash sale applied at read time. */
export async function getAllBooks(): Promise<Book[]> {
  return (await cachedPublishedBooks()).map(applySale);
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  return (await getAllBooks()).find((b) => b.slug === slug);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  return (await getAllBooks()).find((b) => b.id === id);
}
