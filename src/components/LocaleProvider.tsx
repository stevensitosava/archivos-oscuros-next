"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { EUR_LOCALE, type Locale } from "@/lib/money";

const LocaleContext = createContext<Locale>(EUR_LOCALE);

/** Detects the visitor's country (Vercel geo via /api/geo) once on mount and
 *  exposes their local currency + EUR rate so prices render in their money.
 *  Starts as EUR (the SSR/base render → no flash for EU/Spain visitors) and
 *  swaps after detection for everyone else. Prices remain authoritative in EUR;
 *  Stripe Adaptive Pricing performs the actual local charge at checkout. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<Locale>(EUR_LOCALE);

  useEffect(() => {
    let live = true;
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d) => {
        if (live && d && typeof d.currency === "string" && typeof d.rate === "number" && d.rate > 0) {
          setLoc({ currency: d.currency, rate: d.rate });
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return <LocaleContext.Provider value={loc}>{children}</LocaleContext.Provider>;
}

export const useLocale = (): Locale => useContext(LocaleContext);
