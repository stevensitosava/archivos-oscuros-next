import "server-only";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY?.trim() ?? "";

export const isStripeServerConfigured = Boolean(secret);
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

/** Server-side Stripe client. Null in demo mode (no secret key). */
export const stripe: Stripe | null = secret ? new Stripe(secret) : null;
