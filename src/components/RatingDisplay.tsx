import StarIcon from "./StarIcon";

/* Read-only aggregate stars driven by REAL verified-buyer ratings. Renders
   nothing until at least one review exists — no fabricated stars, ever. The
   filled layer is clipped to avg/5 for accurate partial stars. */
export default function RatingDisplay({
  avg,
  count,
  showValue = false,
  className = "",
}: {
  avg?: number | null;
  count?: number;
  showValue?: boolean;
  className?: string;
}) {
  if (!count || !avg) return null;
  const pct = Math.max(0, Math.min(100, (avg / 5) * 100));
  const label = `${avg.toFixed(1)} de 5 · ${count} ${count === 1 ? "valoración" : "valoraciones"}`;
  const row = (cls: string) =>
    [0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className={`w-[1.05em] ${cls}`} />);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label={label}>
      <span className="relative inline-flex leading-none">
        <span className="flex">{row("text-ash-600")}</span>
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          {row("text-gold-400")}
        </span>
      </span>
      {showValue && (
        <span className="tabular-nums text-[0.85rem] text-ash-400">
          {avg.toFixed(1).replace(".", ",")} · {count} {count === 1 ? "valoración" : "valoraciones"}
        </span>
      )}
    </span>
  );
}
