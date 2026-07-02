import "server-only";
import type { NextRequest } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

/* ============================================================
   Rate limiting — NO Redis required.

   Primary backend: the Supabase Postgres you already have. A tiny
   `rate_limits` table + the atomic `rate_limit_hit()` function give
   durable, cross-instance counters on Vercel's serverless at zero
   extra cost / zero extra service.

   Fallback: an in-memory fixed window (used when Supabase isn't
   configured — local/demo — or if the DB call errors). Rate limiting
   is an abuse control, not an authz control, so on a backend hiccup we
   FAIL OPEN to in-memory rather than lock out paying customers.
   ============================================================ */

// In-memory fixed-window fallback.
const mem = new Map<string, { count: number; reset: number }>();
function memLimit(id: string, limit: number, windowMs: number) {
  const now = Date.now();
  let b = mem.get(id);
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    mem.set(id, b);
  }
  b.count += 1;
  if (mem.size > 5000) {
    for (const [k, v] of mem) if (v.reset <= now) mem.delete(k);
  }
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count) };
}

// Cap how long the limiter may block a request. A merely-SLOW Supabase (cold
// start, saturation) doesn't throw, so without this the await would stall the
// critical checkout/download path. On timeout we fail open to in-memory.
const RPC_TIMEOUT_MS = 600;

function withTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("rate_limit_hit timeout")), ms);
    Promise.resolve(p).then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

export async function rateLimit(
  id: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number }> {
  const sb = getServiceSupabase();
  if (sb) {
    const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec;
    try {
      const { data, error } = await withTimeout(
        sb.rpc("rate_limit_hit", {
          p_id: id,
          p_window_start: windowStart,
          p_ttl_seconds: windowSec,
        }),
        RPC_TIMEOUT_MS,
      );
      if (!error && typeof data === "number") {
        return { ok: data <= limit, remaining: Math.max(0, limit - data) };
      }
      // fall through to in-memory on RPC error (fail open)
    } catch {
      // network/DB hiccup or timeout — fail open to in-memory
    }
  }
  return memLimit(id, limit, windowSec * 1000);
}

/**
 * Best-effort client identifier for IP-keyed limits. Trusts ONLY the value the
 * platform edge wrote: x-real-ip (Vercel sets this to the true client IP, not
 * client-spoofable), else the RIGHTMOST x-forwarded-for entry — the one the
 * trusted proxy appended. Never the leftmost, which is attacker-controlled and
 * would let a forged header land in a fresh bucket every request, defeating the
 * limiter. Assumes a single trusted proxy hop (Vercel).
 */
export function clientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]!;
  }
  return "local";
}
