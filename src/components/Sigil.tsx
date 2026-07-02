import type { BookCover } from "../types";

/**
 * Occult line-art sigils drawn on a 100x100 viewBox.
 * Shared by the procedural book covers and decorative flourishes.
 */
export const MOTIF_PATHS: Record<BookCover["motif"], React.ReactNode> = {
  eye: (
    <>
      <path d="M10 50 Q50 20 90 50 Q50 80 10 50 Z" />
      <circle cx="50" cy="50" r="13" />
      <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
    </>
  ),
  moon: (
    <>
      <path d="M62 18 A34 34 0 1 0 62 82 A26 26 0 1 1 62 18 Z" />
      <circle cx="30" cy="30" r="2" fill="currentColor" stroke="none" />
      <circle cx="22" cy="60" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  serpent: (
    <path d="M28 22 C58 22 58 44 38 50 C18 56 18 78 50 78 C70 78 74 66 66 62" />
  ),
  skull: (
    <>
      <path d="M30 38 A20 20 0 0 1 70 38 L70 56 Q70 66 60 66 L60 74 L40 74 L40 66 Q30 66 30 56 Z" />
      <circle cx="42" cy="48" r="5" fill="currentColor" stroke="none" />
      <circle cx="58" cy="48" r="5" fill="currentColor" stroke="none" />
      <path d="M50 56 L46 64 L54 64 Z" fill="currentColor" stroke="none" />
    </>
  ),
  pentacle: (
    <>
      <circle cx="50" cy="50" r="36" />
      <path d="M50 16 L61 70 L18 36 L82 36 L39 70 Z" />
    </>
  ),
  key: (
    <>
      <circle cx="50" cy="30" r="14" />
      <path d="M50 44 L50 86 M50 70 L62 70 M50 78 L60 78" />
    </>
  ),
  candle: (
    <>
      <path d="M44 44 L56 44 L54 84 L46 84 Z" />
      <path d="M50 44 C50 34 42 32 50 18 C58 32 50 34 50 44" />
    </>
  ),
  hand: (
    <>
      <path d="M36 84 L36 50 Q36 44 42 44 Q48 44 48 50 L48 40 Q48 34 54 34 Q60 34 60 40 L60 50 Q60 44 66 44 Q72 44 72 50 L72 70 Q72 84 56 84 Z" />
      <circle cx="54" cy="60" r="7" />
    </>
  ),
};

interface SigilProps {
  motif: BookCover["motif"];
  className?: string;
  /** Stroke width on the 100-unit grid. */
  weight?: number;
}

export default function Sigil({ motif, className, weight = 2 }: SigilProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {MOTIF_PATHS[motif]}
    </svg>
  );
}
