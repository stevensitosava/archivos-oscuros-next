import { formatPrice } from "./format";

/* Visitor's display currency. EUR is the base (no conversion, authoritative);
   any other currency is a live-FX conversion of the EUR price, shown so LatAm /
   non-EU visitors see their own money. Stripe Adaptive Pricing does the real
   local charge at checkout. */
export interface Locale {
  currency: string; // ISO 4217 the visitor sees ("EUR" = base)
  rate: number; // EUR → currency rate (1 for EUR)
}

export const EUR_LOCALE: Locale = { currency: "EUR", rate: 1 };

export const isLocal = (loc: Locale): boolean => loc.currency !== "EUR" && loc.rate > 0;

/** Format an amount given in EUR cents into the visitor's currency.
 *  EUR (or missing rate) → the standard "4,99 €". Otherwise converts and formats
 *  with the local currency's own decimal rules (via Intl), suffixed with the ISO
 *  code to disambiguate the many "$" currencies; big amounts drop decimals. */
export function formatMoney(eurCents: number, loc: Locale): string {
  if (!isLocal(loc)) return formatPrice(eurCents);
  const amount = (eurCents / 100) * loc.rate;
  try {
    const digits = amount >= 1000 ? 0 : 2;
    const nf = new Intl.NumberFormat("es", {
      style: "currency",
      currency: loc.currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return `${nf.format(amount)} ${loc.currency}`;
  } catch {
    return formatPrice(eurCents); // unknown currency → EUR fallback
  }
}
