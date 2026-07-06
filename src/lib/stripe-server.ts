import "server-only";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY?.trim() ?? "";

export const isStripeServerConfigured = Boolean(secret);
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

/**
 * Gates Stripe Tax (`automatic_tax`) on checkout. Keep OFF until Stripe Tax is
 * configured in the Dashboard (origin address + at least one tax registration) —
 * sending `automatic_tax.enabled=true` before then makes `sessions.create` throw
 * and breaks every checkout. Once the Dashboard is ready, set
 * `STRIPE_TAX_ENABLED=true` in the environment and redeploy.
 */
export const STRIPE_TAX_ENABLED = process.env.STRIPE_TAX_ENABLED?.trim() === "true";

/**
 * Stripe product tax code — "Digital Books, downloaded, non-subscription, with
 * permanent rights". Ensures each jurisdiction's ebook rate applies (e.g. Spain's
 * reduced 4% rather than the 21% standard rate) instead of Stripe's default.
 */
export const EBOOK_TAX_CODE = "txcd_10302000";

/** Server-side Stripe client. Null in demo mode (no secret key). */
export const stripe: Stripe | null = secret ? new Stripe(secret) : null;
