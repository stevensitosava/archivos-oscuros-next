import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null>;

/**
 * Thin wrapper over Vercel Analytics custom events. No-ops safely when analytics
 * isn't loaded (local dev, ad-blockers), so call sites never need a guard.
 * Keep event NAMES and prop KEYS stable — renaming starts a fresh series in the
 * dashboard. Funnel: add_to_cart → checkout_started → purchase_completed.
 */
export function trackEvent(name: string, props?: EventProps): void {
  try {
    track(name, props);
  } catch {
    /* analytics unavailable — ignore */
  }
}
