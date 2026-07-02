import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe-server";
import { fulfillCheckout } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

/**
 * POST /api/stripe/confirm { sessionId }
 * Called from the success page as a fallback to the webhook: retrieves the
 * Checkout Session, and if it's paid AND belongs to the signed-in user
 * (metadata.userId), grants entitlements. Idempotent — safe alongside the
 * webhook, and makes local dev work without the Stripe CLI.
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "Pagos no configurados." }, { status: 400 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const rl = await rateLimit(`confirm:${userId}`, 20, 60);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Demasiadas peticiones." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = z.object({ sessionId: z.string().min(1).max(255).startsWith("cs_") }).safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const sessionId = parsed.data.sessionId;

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ ok: false, error: "Sesión no encontrada." }, { status: 200 });
  }

  // Only grant if paid AND the session was created for THIS user.
  if (session.payment_status === "paid" && session.metadata?.userId === userId) {
    const bookIds = (session.metadata?.bookIds ?? "").split(",").filter(Boolean);
    const ok = await fulfillCheckout({
      stripeSessionId: session.id,
      userId,
      bookIds,
      expectedUserId: userId, // bind the grant to the authenticated caller
    });
    return NextResponse.json({ ok });
  }
  return NextResponse.json({ ok: false, status: session.payment_status });
}
