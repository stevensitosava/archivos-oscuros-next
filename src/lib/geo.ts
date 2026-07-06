import "server-only";
import { unstable_cache } from "next/cache";

/* Country (ISO-2, from Vercel's x-vercel-ip-country) → display currency.
   Anything not listed → EUR (the base). Countries whose local currency is
   impractical to display/charge (unstable or restricted) map to USD, which is
   widely understood across LatAm and Stripe-supported. */
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  // USD-using / dollarised
  US: "USD", EC: "USD", PA: "USD", SV: "USD", PR: "USD", CU: "USD", VE: "USD",
  // North & Central America
  MX: "MXN", GT: "GTQ", CR: "CRC", HN: "HNL", NI: "NIO", DO: "DOP",
  // South America
  CO: "COP", PE: "PEN", CL: "CLP", AR: "ARS", UY: "UYU", BO: "BOB", PY: "PYG",
  BR: "BRL",
  // A few other majors
  GB: "GBP", CA: "CAD", CH: "CHF", AU: "AUD", JP: "JPY",
};

/** Rough EUR→X fallbacks used only if the live rate API is unreachable. */
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.08, MXN: 20, GTQ: 8.4, CRC: 560, HNL: 27, NIO: 40, DOP: 65,
  COP: 4300, PEN: 4.05, CLP: 1030, ARS: 1150, UYU: 43, BOB: 7.5, PYG: 8200,
  BRL: 6.0, GBP: 0.84, CAD: 1.48, CHF: 0.94, AUD: 1.65, JPY: 170,
};

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR");
    const j = await res.json();
    if (j?.result === "success" && j.rates && typeof j.rates.USD === "number") return j.rates;
  } catch {
    /* fall through to fallbacks */
  }
  return FALLBACK_RATES;
}

/** EUR→currency rates, refreshed at most once a day (tagged cache). */
export const getFxRates = unstable_cache(fetchRates, ["fx-eur-rates"], {
  revalidate: 86400,
  tags: ["fx"],
});

export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return "EUR";
  return CURRENCY_BY_COUNTRY[country.toUpperCase()] ?? "EUR";
}
