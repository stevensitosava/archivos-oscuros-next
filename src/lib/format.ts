/** Format a price in cents as EUR, Spanish locale (e.g. 999 -> "9,99 €"). */
export function formatPrice(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Format an ISO date as a Spanish long date (e.g. "29 jun 2026"). */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
