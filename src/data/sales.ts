/* ============================================================
   Flash sales — time-based, self-reverting. The effective price
   drops to `salePriceCents` until `endsAt`, then returns to the
   book's normal price AUTOMATICALLY by the clock. No cron, no job
   to fire (nothing to fail): the price is recomputed on each read.
   To run a sale: add an entry. To end early: remove it (or shorten
   endsAt) and redeploy. Expired entries are harmless.
   ============================================================ */

export interface FlashSale {
  /** Sale price in cents while the sale is live. */
  salePriceCents: number;
  /** ISO 8601 end time (UTC). The price reverts the instant this passes. */
  endsAt: string;
}

export const FLASH_SALES: Record<string, FlashSale> = {
  // El Manual del Legionario Romano — flash sale (2026-07-02, ends 16:52 UTC).
  // Price is 0,50 €: Stripe's hard minimum charge for EUR is €0.50, so a lone
  // book can't be sold for less. Still ~90% off the 4,99 € list price.
  "ao-003": { salePriceCents: 50, endsAt: "2026-07-02T16:52:00.000Z" },
};

/** The active sale for a book right now, or null. */
export function activeSale(bookId: string, now: number = Date.now()): FlashSale | null {
  const s = FLASH_SALES[bookId];
  if (!s) return null;
  return Date.parse(s.endsAt) > now ? s : null;
}
