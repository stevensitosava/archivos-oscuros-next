/** Pure star glyph (no hooks/server APIs → usable in server + client components).
 *  Color via `currentColor`; size via a `w-*` class on `className`. */
export default function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M12 2.4l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 18.02l-5.88 3.09 1.12-6.55L2.48 9.32l6.58-.96L12 2.4z" />
    </svg>
  );
}
