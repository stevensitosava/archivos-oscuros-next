"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase-server";
import { ownsBook } from "@/lib/db";
import { REVIEWS_TAG } from "@/lib/reviews";
import { BOOKS_TAG } from "@/lib/books-data";
import { rateLimit } from "@/lib/ratelimit";

const schema = z.object({
  bookId: z.string().min(1).max(40),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

/** Submit/update a star rating. VERIFIED BUYERS ONLY — the user must be signed
 *  in AND own the book (checked server-side against entitlements). Never trusts
 *  the client. */
export async function submitReview(input: unknown): Promise<ReviewResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Inicia sesión para valorar." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Valoración no válida." };
  const { bookId, rating, comment } = parsed.data;

  const rl = await rateLimit(`review:${userId}`, 20, 60);
  if (!rl.ok) return { ok: false, error: "Demasiadas peticiones — espera un momento." };

  // The gate: only someone who actually owns the book can rate it.
  if (!(await ownsBook(userId, bookId))) {
    return { ok: false, error: "Solo puedes valorar libros que hayas adquirido." };
  }

  const sb = getServiceSupabase();
  if (!sb) return { ok: false, error: "No disponible en este momento." };
  const { error } = await sb.from("reviews").upsert(
    {
      book_id: bookId,
      user_id: userId,
      rating,
      comment: comment ? comment : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" },
  );
  if (error) return { ok: false, error: "No se pudo guardar la valoración." };

  updateTag(REVIEWS_TAG); // refresh the aggregate stars (read-your-own-writes)
  updateTag(BOOKS_TAG);
  return { ok: true };
}
