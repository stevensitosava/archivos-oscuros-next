/* ============================================================
   Centralized, typed env + capability flags (client-safe).
   Graceful degradation: the app runs in DEMO mode with ZERO keys;
   real services (Clerk / Supabase / Stripe) layer in when keys exist.
   ONLY NEXT_PUBLIC_* vars belong here (this module is imported by
   client components). Server secrets are read in server-only modules.
   ============================================================ */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
export const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

/**
 * Canonical site origin (metadata, canonical URLs, sitemap/robots, Stripe
 * redirects). Prefers NEXT_PUBLIC_SITE_URL; otherwise auto-derives from Vercel's
 * platform env (VERCEL_PROJECT_PRODUCTION_URL) so it's correct in production with
 * zero manual config; falls back to localhost for local dev. Used server-side
 * only, so the client/server divergence when NEXT_PUBLIC_SITE_URL is unset is
 * inconsequential.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

/** Gates real auth UI + protected routes. */
export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY);
/** Gates DB-backed catalog, orders, entitlements, secure downloads. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
/** Gates real Stripe checkout. */
export const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);
