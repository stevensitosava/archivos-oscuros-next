import "server-only";
import { getServiceSupabase } from "./supabase-server";

/* DB write layer for the book CMS (service role). Callers (server actions)
   must assertAdmin() first and handle cache revalidation. */

export interface BookInput {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  priceCents: number;
  currency: string;
  tagline: string;
  synopsis: string;
  pages: number;
  year: number;
  language: string;
  tags: string[];
  formats: string[];
  coverMotif: string;
  coverImage: string | null;
  stripePriceId: string | null;
  storagePath: string | null;
  featured: boolean;
  rating: number;
  sortOrder: number;
  published: boolean;
}

function toRow(b: BookInput) {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    author: b.author,
    category: b.category,
    price_cents: b.priceCents,
    currency: b.currency,
    tagline: b.tagline,
    synopsis: b.synopsis,
    pages: b.pages,
    year: b.year,
    language: b.language,
    tags: b.tags,
    formats: b.formats,
    cover_motif: b.coverMotif,
    cover_image: b.coverImage,
    stripe_price_id: b.stripePriceId,
    storage_path: b.storagePath,
    featured: b.featured,
    rating: b.rating,
    sort_order: b.sortOrder,
    published: b.published,
    updated_at: new Date().toISOString(),
  };
}

export async function createBook(b: BookInput): Promise<{ ok: boolean; error?: string }> {
  const sb = getServiceSupabase();
  if (!sb) return { ok: false, error: "Base de datos no conectada." };
  const { error } = await sb.from("books").insert(toRow(b));
  if (error) return { ok: false, error: error.code === "23505" ? "Ya existe un libro con ese ID o slug." : error.message };
  return { ok: true };
}

export async function updateBook(id: string, b: BookInput): Promise<{ ok: boolean; error?: string }> {
  const sb = getServiceSupabase();
  if (!sb) return { ok: false, error: "Base de datos no conectada." };
  const { error } = await sb.from("books").update(toRow(b)).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBook(id: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getServiceSupabase();
  if (!sb) return { ok: false, error: "Base de datos no conectada." };
  const { error } = await sb.from("books").delete().eq("id", id);
  if (error) {
    // FK violation (book referenced by an order/entitlement) → unpublish instead of hard-delete.
    if (error.code === "23503") {
      const { error: e2 } = await sb.from("books").update({ published: false }).eq("id", id);
      if (e2) return { ok: false, error: e2.message };
      return { ok: true, error: "El libro tiene compras asociadas; se ha ocultado en lugar de borrarse." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
