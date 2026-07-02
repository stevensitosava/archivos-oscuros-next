import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOwnedBookIds } from "@/lib/db";
import { syncProfile } from "@/lib/profile-sync";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/me/entitlements → { ids: string[] } the signed-in user owns. */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const rl = await rateLimit(`ent:${userId ?? clientIp(req)}`, 60, 60);
  if (!rl.ok) {
    return NextResponse.json({ ids: [] }, { status: 429, headers: { "Cache-Control": "private, no-store" } });
  }
  if (!userId) return NextResponse.json({ ids: [] });
  // Mirror the user into `profiles` for the CRM (deduped, best-effort). This
  // route fires on every signed-in page load, so it captures every active user.
  await syncProfile(userId);
  const ids = await getOwnedBookIds(userId);
  return NextResponse.json({ ids }, { headers: { "Cache-Control": "private, no-store" } });
}
