import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, type User } from "@clerk/nextjs/server";
import { z } from "zod";
import type { Book } from "@/types";
import { stripe, isStripeServerConfigured, STRIPE_TAX_ENABLED, EBOOK_TAX_CODE } from "@/lib/stripe-server";
import { getBookById } from "@/lib/books-data";
import { createOrder, grantEntitlement, getOwnedBookIds, subscribeNewsletter } from "@/lib/db";
import { paidTotal, offerLabel } from "@/data/bundles";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const MAX_ITEMS = 50;
const CheckoutSchema = z.object({
  bookIds: z.array(z.string().min(1).max(64)).min(1).max(MAX_ITEMS),
  marketingConsent: z.boolean().optional(),
});

function primaryEmail(user: User | null): string | undefined {
  if (!user) return undefined;
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  return (primary ?? user.emailAddresses[0])?.emailAddress;
}

/**
 * POST /api/stripe/checkout  { bookIds: string[] }
 * Creates a Stripe Checkout Session for the paid books + a `pending` order keyed
 * by the session id. The order/metadata carry ALL ids (free + paid); the webhook
 * (and the /compra/exito confirm fallback) grant entitlements on payment success.
 * Free books in a mixed cart are NOT granted until payment succeeds. A free-only
 * cart skips Stripe and is granted directly. Returns { url }.
 */
export async function POST(req: NextRequest) {
  if (!isStripeServerConfigured || !stripe) {
    return NextResponse.json({ error: "Pagos no configurados." }, { status: 400 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Inicia sesión para comprar." }, { status: 401 });
  }

  const rl = await rateLimit(`checkout:${userId}`, 10, 60);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiadas peticiones. Espera un momento." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }
  const parsed = CheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }
  const ids = [...new Set(parsed.data.bookIds)];
  const resolved = (await Promise.all(ids.map((id) => getBookById(id)))).filter(
    (b): b is Book => Boolean(b),
  );
  if (resolved.length === 0) {
    return NextResponse.json({ error: "Carrito vacío." }, { status: 400 });
  }

  // Drop anything the user already owns — never charge twice for the same ebook.
  const owned = new Set(await getOwnedBookIds(userId));
  const books = resolved.filter((b) => !owned.has(b.id));
  if (books.length === 0) {
    return NextResponse.json({ error: "Ya posees estos títulos." }, { status: 409 });
  }

  // Resolve the buyer's email once; opt them into the newsletter here if they chose to.
  const email = primaryEmail(await currentUser());
  if (parsed.data.marketingConsent === true && email) {
    await subscribeNewsletter(email, "checkout", true);
  }

  const origin = req.nextUrl.origin;
  const paid = books.filter((b) => b.priceCents > 0);

  // Free-only cart → no payment; grant directly.
  if (paid.length === 0) {
    for (const b of books) await grantEntitlement(userId, b.id, null);
    return NextResponse.json({ url: `${origin}/compra/exito` });
  }

  // Quantity bundle: when the paid books hit a tier, charge ONE discounted line
  // for the whole pack instead of per-book. Free titles still ride along in the
  // metadata and are granted on success. The server is the price authority — the
  // client total is never trusted.
  const { total, bundle, savings } = paidTotal(paid);
  const currency = (paid[0].currency || "EUR").toLowerCase();

  // Stripe rejects any charge under €0.50 (its EUR minimum). Fail with a clear
  // message instead of letting sessions.create throw a 502 — e.g. a lone book on
  // a deep flash sale.
  const STRIPE_MIN_CENTS = 50;
  if (total < STRIPE_MIN_CENTS) {
    return NextResponse.json(
      { error: "El pago mínimo es 0,50 €. Añade otro título para completar la compra." },
      { status: 400 },
    );
  }

  // Stripe Tax fields, applied only when tax is switched on. Prices are advertised
  // "IVA incluido", so tax is INCLUSIVE — the buyer's total never changes; Stripe
  // just backs out the VAT portion. The ebook tax code pins the reduced ebook rate.
  const taxPriceFields = STRIPE_TAX_ENABLED ? { tax_behavior: "inclusive" as const } : {};
  const taxProductFields = STRIPE_TAX_ENABLED ? { tax_code: EBOOK_TAX_CODE } : {};

  const line_items = bundle && savings > 0
    ? [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: total,
            ...taxPriceFields,
            product_data: {
              name: `${offerLabel(paid.length, bundle)} · ${paid.length} libros`,
              description: paid.map((b) => b.title).join(", ").slice(0, 250),
              ...taxProductFields,
            },
          },
        },
      ]
    : paid.map((b) => ({
        quantity: 1,
        price_data: {
          currency: (b.currency || "EUR").toLowerCase(),
          unit_amount: b.priceCents,
          ...taxPriceFields,
          product_data: { name: b.title, description: b.tagline?.slice(0, 120), ...taxProductFields },
        },
      }));

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: email,
      // Stripe Tax: computes destination VAT and collects the buyer's location.
      // Compatible with Adaptive Pricing (not on its restriction list). Off until
      // the Dashboard is configured — see STRIPE_TAX_ENABLED.
      ...(STRIPE_TAX_ENABLED ? { automatic_tax: { enabled: true } } : {}),
      success_url: `${origin}/compra/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/compra/cancelada`,
      // ALL ids (free + paid) — free titles are fulfilled together on success.
      metadata: { userId, bookIds: books.map((b) => b.id).join(",") },
    });
  } catch (e) {
    console.warn("[stripe] session create failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502 });
  }

  const orderId = await createOrder({
    userId,
    email,
    totalCents: total,
    currency: paid[0].currency,
    stripeSessionId: session.id,
    status: "pending",
    items: books.map((b) => ({ bookId: b.id, priceCents: b.priceCents })),
  });
  if (!orderId) {
    console.warn("[stripe] createOrder null for", session.id, "— fulfillment falls back to metadata");
  }

  if (!session.url) {
    return NextResponse.json({ error: "No se pudo crear la sesión de pago." }, { status: 500 });
  }
  return NextResponse.json({ url: session.url });
}
