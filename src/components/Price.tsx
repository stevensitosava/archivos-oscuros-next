import { formatPrice } from "../lib/format";

interface PriceProps {
  cents: number;
  currency?: string;
  className?: string;
  /** Pre-sale price — when > cents, renders as a strikethrough beside the sale price. */
  originalCents?: number;
}

const MONO = { fontFamily: "var(--font-mono)" };

/** Price display. "Gratis" (ember) for free titles; gold price otherwise. When
 *  `originalCents` is a higher pre-sale price, shows the sale price in ember with
 *  the old price struck through. */
export default function Price({ cents, currency = "EUR", className = "", originalCents }: PriceProps) {
  if (cents <= 0) {
    return (
      <span className={`font-mono uppercase tracking-wide text-ember-400 ${className}`} style={MONO}>
        Gratis
      </span>
    );
  }

  const onSale = typeof originalCents === "number" && originalCents > cents;
  if (!onSale) {
    return (
      <span className={`font-mono tabular-nums text-gold-400 ${className}`} style={MONO}>
        {formatPrice(cents, currency)}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-mono tabular-nums text-ember-300" style={MONO}>
        {formatPrice(cents, currency)}
      </span>
      <span className="font-mono text-[0.6em] tabular-nums text-ash-500 line-through" style={MONO}>
        {formatPrice(originalCents, currency)}
      </span>
    </span>
  );
}
