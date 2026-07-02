/* ============================================================
   Bundle offers — automatic quantity discounts applied to the
   PAID books in a cart (the free title never counts / never
   costs). Pure logic, shared by the cart UI, the checkout summary
   and the server-side Stripe charge so all three always agree.
   ============================================================ */

export interface BundleTier {
  /** Minimum number of PAID books for this tier to apply. */
  minBooks: number;
  /** Total price (cents) for the whole pack. */
  priceCents: number;
  label: string;
}

/** Highest tier first — bundleFor() picks the best applicable one.
 *  Labels are quantity-based ("Pack de 5", not "Colección completa") so they
 *  stay honest as the catalog grows beyond 5 paid titles. */
export const BUNDLE_TIERS: BundleTier[] = [
  { minBooks: 5, priceCents: 1499, label: "Pack de 5" },
  { minBooks: 3, priceCents: 999, label: "Pack de 3" },
];

/** Best bundle for a given number of paid books, or null. */
export function bundleFor(paidCount: number): BundleTier | null {
  return BUNDLE_TIERS.find((t) => paidCount >= t.minBooks) ?? null;
}

export interface PaidTotal {
  /** What the buyer actually pays for the paid books (cents). */
  total: number;
  /** Sum of individual prices with no bundle (cents). */
  fullPrice: number;
  /** Best tier reached (labeling), or null. */
  bundle: BundleTier | null;
  /** Savings vs buying separately (cents). */
  savings: number;
}

/** Cheapest way to buy a set of prices: try each tier on the N most expensive
 *  books + best price for the rest, vs. paying full. Carts are tiny (≤ catalog
 *  size), so the recursion is trivially cheap. Prevents the "4 books cost the
 *  same as 3" hole a flat tier price would create. */
function bestPrice(pricesDesc: number[]): number {
  const sum = pricesDesc.reduce((s, p) => s + p, 0);
  let best = sum;
  for (const t of BUNDLE_TIERS) {
    if (pricesDesc.length >= t.minBooks) {
      best = Math.min(best, t.priceCents + bestPrice(pricesDesc.slice(t.minBooks)));
    }
  }
  return best;
}

/** Effective price for the paid books, applying the best bundle combination. */
export function paidTotal(paidBooks: { priceCents: number }[]): PaidTotal {
  const prices = paidBooks.map((b) => b.priceCents).sort((a, b) => b - a);
  const fullPrice = prices.reduce((s, p) => s + p, 0);
  const total = bestPrice(prices);
  const savings = Math.max(0, fullPrice - total);
  // Only claim a bundle when it actually discounts something.
  const bundle = savings > 0 ? bundleFor(paidBooks.length) : null;
  return { total, fullPrice, bundle, savings };
}

/** Customer-facing label for the applied offer (avoids "Pack de 3 · 4 libros"). */
export function offerLabel(paidCount: number, bundle: BundleTier | null): string {
  if (!bundle) return "";
  return paidCount === bundle.minBooks ? bundle.label : "Oferta combinada";
}

/** Upsell nudge: how many more paid books unlock the next tier. */
export function nextBundleHint(paidCount: number): { needed: number; tier: BundleTier } | null {
  const upcoming = [...BUNDLE_TIERS]
    .sort((a, b) => a.minBooks - b.minBooks)
    .find((t) => t.minBooks > paidCount);
  return upcoming ? { needed: upcoming.minBooks - paidCount, tier: upcoming } : null;
}
