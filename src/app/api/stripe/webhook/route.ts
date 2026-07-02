import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe-server";
import { fulfillCheckout } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/stripe/webhook — Stripe events (signature-verified).
 * On `checkout.session.completed` (paid), flips the matching order to paid and
 * grants its entitlements. Idempotent. Register this URL + secret in the Stripe
 * dashboard (or `stripe listen --forward-to .../api/stripe/webhook`).
 */
export async function POST(req: NextRequest) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook no configurado." }, { status: 400 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Falta la firma." }, { status: 400 });
  }

  const raw = await req.text(); // RAW body required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "firma inválida";
    return NextResponse.json({ error: `Firma inválida: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const owner = session.metadata?.userId;
      const bookIds = (session.metadata?.bookIds ?? "").split(",").filter(Boolean);
      if (owner && bookIds.length > 0) {
        const ok = await fulfillCheckout({ stripeSessionId: session.id, userId: owner, bookIds });
        // 5xx → Stripe retries with backoff until the grant succeeds.
        if (!ok) {
          return NextResponse.json({ error: "Fulfillment falló." }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
