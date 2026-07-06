import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserRating } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/reviews/mine?bookId=… → { rating: number | null } for the signed-in
 *  user (prefills the star widget). Private, never cached. */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const bookId = req.nextUrl.searchParams.get("bookId");
  if (!userId || !bookId) {
    return NextResponse.json({ rating: null }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const rating = await getUserRating(userId, bookId);
  return NextResponse.json({ rating }, { headers: { "Cache-Control": "private, no-store" } });
}
