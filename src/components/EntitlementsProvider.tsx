"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { readDemoOwned } from "@/lib/demo-library";

interface EntitlementsValue {
  ownedIds: Set<string>;
  owns: (bookId: string) => boolean;
  loaded: boolean;
  refresh: () => void;
}

const Ctx = createContext<EntitlementsValue | null>(null);

/**
 * Tracks which books the current user owns so the UI can show "Comprado" /
 * download instead of letting them buy a book twice. Real mode → /api/me/
 * entitlements (Clerk + DB). Demo mode → localStorage.
 */
export function EntitlementsProvider({ children }: { children: ReactNode }) {
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const lastFetchRef = useRef(0);

  const refresh = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch("/api/me/entitlements", { cache: "no-store" });
        // On a non-2xx (e.g. 429 rate-limited) the body is an empty {ids:[]} that
        // is indistinguishable from a genuinely-empty library — keep the previous
        // owned set rather than wiping it and flashing "Comprar" on owned books.
        if (!res.ok) return;
        const body = (await res.json()) as { ids?: string[] };
        setOwnedIds(new Set(Array.isArray(body.ids) ? body.ids : []));
      } catch {
        // Network error — keep whatever we already had; don't clear ownership.
      }
    } else {
      setOwnedIds(new Set(readDemoOwned()));
    }
    lastFetchRef.current = Date.now();
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-check when the tab regains focus (e.g. after returning from Stripe),
  // but throttle so a focus storm can't self-inflict the rate limit.
  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastFetchRef.current > 8000) refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const value = useMemo<EntitlementsValue>(
    () => ({ ownedIds, owns: (id) => ownedIds.has(id), loaded, refresh }),
    [ownedIds, loaded, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEntitlements(): EntitlementsValue {
  const ctx = useContext(Ctx);
  // Safe default so components never crash outside the provider.
  if (!ctx) return { ownedIds: new Set(), owns: () => false, loaded: false, refresh: () => {} };
  return ctx;
}
