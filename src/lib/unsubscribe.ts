import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "./env";

/* One-click unsubscribe tokens. Stateless: an HMAC of the email means we can
   verify a link without storing a token per subscriber. The secret falls back
   to the service-role key (always present in prod) so no extra env var is
   required; set NEWSLETTER_SECRET to rotate independently. Low-stakes integrity
   (prevents unsubscribing arbitrary addresses), not confidentiality. */
const SECRET =
  process.env.NEWSLETTER_SECRET?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.CLERK_SECRET_KEY?.trim() ||
  "archivos-oscuros-dev-secret";

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

/** URL-safe HMAC token for an email. */
export function signUnsubscribe(email: string): string {
  return createHmac("sha256", SECRET)
    .update(normalize(email))
    .digest("base64url");
}

/** Constant-time token check. */
export function verifyUnsubscribe(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = signUnsubscribe(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Absolute unsubscribe link for a given email. */
export function unsubscribeUrl(email: string): string {
  const qs = new URLSearchParams({ e: normalize(email), t: signUnsubscribe(email) });
  return `${SITE_URL}/baja?${qs.toString()}`;
}
