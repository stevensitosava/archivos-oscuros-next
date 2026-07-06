import "server-only";
import { unstable_cache } from "next/cache";
import { getServiceSupabase } from "./supabase-server";

/* ============================================================
   Real verified-buyer ratings. Aggregates (avg + count) are read
   through a tagged cache and merged onto books in books-data.ts.
   A submitted review revalidates REVIEWS_TAG so the stars refresh.
   Degrades to empty (no stars) when the table/DB is absent.
   ============================================================ */

export const REVIEWS_TAG = "reviews";

export interface RatingAgg {
  avg: number;
  count: number;
}

async function fetchAggregates(): Promise<Record<string, RatingAgg>> {
  const sb = getServiceSupabase();
  if (!sb) return {};
  const { data, error } = await sb.from("reviews").select("book_id, rating");
  if (error || !data) return {};
  const acc: Record<string, { sum: number; count: number }> = {};
  for (const r of data) {
    const b = r.book_id as string;
    (acc[b] ??= { sum: 0, count: 0 });
    acc[b].sum += r.rating as number;
    acc[b].count += 1;
  }
  const out: Record<string, RatingAgg> = {};
  for (const [b, v] of Object.entries(acc)) out[b] = { avg: v.sum / v.count, count: v.count };
  return out;
}

/** Avg + count per book id (tagged cache, 5-min TTL, refreshed on new review). */
export const getRatingAggregates = unstable_cache(fetchAggregates, ["review-aggregates"], {
  tags: [REVIEWS_TAG],
  revalidate: 300,
});

/** The signed-in user's own rating for a book (to prefill the form), or null. */
export async function getUserRating(userId: string, bookId: string): Promise<number | null> {
  const sb = getServiceSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("reviews")
    .select("rating")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  return (data?.rating as number | undefined) ?? null;
}
