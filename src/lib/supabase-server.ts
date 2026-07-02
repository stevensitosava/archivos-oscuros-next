import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

export const isServiceSupabaseConfigured = Boolean(url && serviceKey);

/**
 * Privileged server-side Supabase client (service role — BYPASSES RLS).
 * NEVER import this from a client component. Authorization is enforced in the
 * server layer (Clerk auth() → scope every query by the caller's user id).
 * Returns null in demo mode so callers can gracefully degrade.
 */
let cached: SupabaseClient | null = null;

export function getServiceSupabase(): SupabaseClient | null {
  if (!isServiceSupabaseConfigured) return null;
  // Reuse a single stateless REST client across requests (called on every
  // rate-limited route) instead of reconstructing it each time.
  if (!cached) cached = createClient(url, serviceKey, { auth: { persistSession: false } });
  return cached;
}
