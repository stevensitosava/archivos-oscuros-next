"use client";

import { formatPrice } from "../lib/format";
import { formatMoney, isLocal } from "../lib/money";
import { useLocale } from "./LocaleProvider";

interface PriceProps {
  cents: number;
  /** Base currency of the amount — always EUR here; kept for call-site compat. */
  currency?: string;
  className?: string;
  /** Pre-sale price — when > cents, renders as a strikethrough beside the sale price. */
  originalCents?: number;
}

const MONO = { fontFamily: "var(--font-mono)" };

/** Price display, localized to the visitor's currency (EUR is the base). Shows
 *  the local price with a subtle EUR reference; "Gratis" for free titles; the
 *  sale price + struck original when on sale. */
export default function Price({ cents, className = "", originalCents }: PriceProps) {
  const loc = useLocale();

  if (cents <= 0) {
    return (
      <span className={`font-mono uppercase tracking-wide text-ember-400 ${className}`} style={MONO}>
        Gratis
      </span>
    );
  }

  const onSale = typeof originalCents === "number" && originalCents > cents;
  const local = isLocal(loc);

  if (!onSale) {
    return (
      <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 ${className}`}>
        <span className="font-mono tabular-nums text-gold-400" style={MONO}>
          {formatMoney(cents, loc)}
        </span>
        {local && (
          <span className="font-mono text-[0.62em] tabular-nums text-ash-500" style={MONO}>
            {formatPrice(cents)}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="font-mono tabular-nums text-ember-300" style={MONO}>
        {formatMoney(cents, loc)}
      </span>
      <span className="font-mono text-[0.6em] tabular-nums text-ash-500 line-through" style={MONO}>
        {formatMoney(originalCents, loc)}
      </span>
    </span>
  );
}
