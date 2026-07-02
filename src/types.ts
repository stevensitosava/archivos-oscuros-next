/* ============================================================
   ARCHIVOS OSCUROS — shared domain types (single source of truth)
   ============================================================ */

/** Catalog categories (Spanish slugs used in routes + filters). */
export type Category =
  | "estoicismo"
  | "guerreros"
  | "historia"
  | "filosofia";

export const CATEGORIES: { slug: Category; label: string; blurb: string }[] = [
  { slug: "estoicismo", label: "Estoicismo", blurb: "Calma forjada bajo presión." },
  { slug: "guerreros", label: "Guerreros", blurb: "Códigos de honor y disciplina marcial." },
  { slug: "historia", label: "Historia", blurb: "Roma, Esparta y las grandes campañas." },
  { slug: "filosofia", label: "Filosofía", blurb: "Sabiduría dura para tiempos blandos." },
];

/** Downloadable file formats for an ebook. */
export type BookFormat = "EPUB" | "PDF" | "MOBI";

/** Procedural cover description (we render covers in code — no stock art). */
export interface BookCover {
  /** Base background color (hex) for the procedural cover. */
  bg: string;
  /** Ink/foreground color (hex). */
  ink: string;
  /** Sigil/motif key drawn on the cover. */
  motif: "eye" | "moon" | "serpent" | "skull" | "pentacle" | "key" | "candle" | "hand";
  /** Optional real cover image URL (overrides the procedural cover when set). */
  image?: string;
}

/** A single ebook in the catalog. */
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: Category;
  /** One-line hook shown on cards. */
  tagline: string;
  /** Long description (book detail page). Plain text, paragraphs split on \n\n. */
  synopsis: string;
  /** Price in cents (EUR). */
  priceCents: number;
  currency: "EUR";
  formats: BookFormat[];
  pages: number;
  /** Publication / release year. */
  year: number;
  language: "Español";
  tags: string[];
  /** Archive catalog code, e.g. "AO-013". */
  code: string;
  cover: BookCover;
  featured?: boolean;
  /** 0–5, one decimal. */
  rating: number;
  /** Stripe Price ID (optional — falls back to dynamic price when unset). */
  stripePriceId?: string;
  /** Public file served in demo mode (e.g. the real PDF in /public). */
  fileUrl?: string;
  /** During a flash sale, the pre-sale price (for the strikethrough). Resolved
   *  at read time from the sales config — not stored on the book. */
  originalPriceCents?: number;
  /** ISO end time of the active flash sale (drives the countdown). Read-time. */
  saleEndsAt?: string;
}

/** A line in the shopping cart. Ebooks are unique, qty is always 1, kept for shape. */
export interface CartLine {
  bookId: string;
  qty: number;
}

/** Authenticated user profile (mirrors Supabase `profiles`). */
export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

/** A completed/attempted purchase (mirrors Supabase `orders`). */
export interface Order {
  id: string;
  status: OrderStatus;
  totalCents: number;
  currency: "EUR";
  createdAt: string;
  bookIds: string[];
}

/** Proof a user owns a book and may download it (mirrors `entitlements`). */
export interface Entitlement {
  bookId: string;
  orderId: string;
  grantedAt: string;
}
