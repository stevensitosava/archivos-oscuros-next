/* Demo-mode ownership (no Supabase): localStorage-backed so the
   buy → library → download flow is fully testable without a backend.
   In real mode entitlements live in the DB (src/lib/db.ts) instead. */

const DEMO_OWNED_KEY = "ao_demo_owned_v1";

export function readDemoOwned(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_OWNED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Grant ownership locally (demo checkout success). */
export function grantDemoOwnership(bookIds: string[]): void {
  if (typeof window === "undefined") return;
  const set = new Set([...readDemoOwned(), ...bookIds]);
  try {
    localStorage.setItem(DEMO_OWNED_KEY, JSON.stringify([...set]));
  } catch {
    /* storage full / disabled */
  }
}
