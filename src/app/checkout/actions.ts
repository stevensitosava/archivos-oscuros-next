"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { isStripeServerConfigured } from "@/lib/stripe-server";
import { createOrder, grantEntitlement, getOwnedBookIds, subscribeNewsletter } from "@/lib/db";
import { getBookById } from "@/lib/books-data";

/**
 * Transitional DEV-ONLY grant for testing the purchase → library → download
 * flow before Stripe is wired. Triple-gated so a production/ops mistake can
 * NEVER turn it into a free-paid-book exploit: requires (1) NODE_ENV !==
 * production, (2) an explicit ALLOW_DEV_PURCHASE=true opt-in, and (3) Stripe
 * fully unconfigured. This is intentionally decoupled from the client UI flag
 * (which is the publishable key) — the two must never be satisfiable
 * independently. Disabled by default.
 */
const DEV_PURCHASE_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_DEV_PURCHASE === "true" &&
  !isStripeServerConfigured;

export async function confirmDevPurchase(
  bookIds: string[],
  marketingConsent?: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (!DEV_PURCHASE_ENABLED) {
    return { ok: false, error: "disabled" };
  }
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "signin" };

  // Skip anything already owned — no duplicate orders/entitlements.
  const owned = new Set(await getOwnedBookIds(userId));
  const resolved = await Promise.all(bookIds.map((id) => getBookById(id)));
  const items = resolved
    .map((b) => (b && !owned.has(b.id) ? { bookId: b.id, priceCents: b.priceCents } : null))
    .filter((x): x is { bookId: string; priceCents: number } => Boolean(x));
  if (items.length === 0) return { ok: false, error: "empty" };

  const total = items.reduce((s, i) => s + i.priceCents, 0);
  const orderId = await createOrder({ userId, totalCents: total, items, status: "paid" });
  for (const it of items) {
    await grantEntitlement(userId, it.bookId, orderId);
  }

  if (marketingConsent) {
    const user = await currentUser();
    const email =
      user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user?.emailAddresses[0]?.emailAddress;
    if (email) await subscribeNewsletter(email, "checkout", true);
  }

  return { ok: true };
}
