interface RatingStarsProps {
  rating: number;
  className?: string;
  showValue?: boolean;
}

/** Five candle-gold stars with fractional fill, plus optional numeric value. */
export default function RatingStars({ rating, className = "", showValue }: RatingStarsProps) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="relative inline-block leading-none"
        aria-label={`Valoración ${rating.toFixed(1)} de 5`}
        title={`${rating.toFixed(1)} / 5`}
      >
        <span className="text-ink-700 select-none">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden text-gold-400 select-none"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          ★★★★★
        </span>
      </span>
      {showValue && (
        <span className="meta text-ash-400" style={{ fontFamily: "var(--font-mono)" }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
