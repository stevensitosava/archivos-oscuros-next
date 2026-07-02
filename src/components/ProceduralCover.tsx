import type { Book } from "../types";
import Sigil from "./Sigil";
import CoverImage from "./CoverImage";

interface ProceduralCoverProps {
  book: Book;
  /** Extra classes for the cover frame. */
  className?: string;
  /** Hide the small catalog code at the bottom (used on dense grids). */
  hideCode?: boolean;
  /** Preload this cover (use for the LCP cover on the book-detail page). */
  priority?: boolean;
}

/* Monochrome cover palette (cinematic minimal theme). */
const COVER_BG = "#171717";
const COVER_INK = "#ececee";

/**
 * Renders a book cover entirely in code — no stock art.
 * Uses a real image when `book.cover.image` is set, otherwise draws a
 * minimal typographic cover (off-white ink on neutral dark) + sigil motif.
 */
export default function ProceduralCover({ book, className = "", hideCode, priority }: ProceduralCoverProps) {
  const { cover } = book;

  if (cover.image) {
    return (
      <div className={`cover-frame ${className}`}>
        <CoverImage src={cover.image} alt={`Portada de ${book.title}`} priority={priority} />
      </div>
    );
  }

  return (
    <div
      className={`cover-frame ${className}`}
      style={{ background: `linear-gradient(155deg, ${COVER_BG}, #050505 92%)` }}
      role="img"
      aria-label={`Portada de ${book.title} por ${book.author}`}
    >
      <div className="relative flex h-full flex-col justify-between p-[7%]" style={{ color: COVER_INK }}>
        {/* Inner ruled frame */}
        <span
          className="pointer-events-none absolute inset-[5%] rounded-[2px] border"
          style={{ borderColor: `color-mix(in srgb, ${COVER_INK} 22%, transparent)` }}
        />

        <p
          className="meta z-10 text-[0.5rem]"
          style={{ color: `color-mix(in srgb, ${COVER_INK} 60%, transparent)` }}
        >
          ARCHIVOS OSCUROS
        </p>

        <Sigil motif={cover.motif} weight={1.6} className="z-10 mx-auto my-2 w-[42%] opacity-85" />

        <div className="z-10 text-center">
          <h3
            className="leading-[0.98]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(1rem, 1.7vw + 0.6rem, 1.6rem)",
              color: COVER_INK,
            }}
          >
            {book.title}
          </h3>
          <p
            className="mt-[6%] text-[0.62rem] uppercase tracking-[0.2em]"
            style={{ color: `color-mix(in srgb, ${COVER_INK} 70%, transparent)` }}
          >
            {book.author}
          </p>
        </div>

        {!hideCode && (
          <p
            className="meta z-10 text-center text-[0.5rem]"
            style={{ color: `color-mix(in srgb, ${COVER_INK} 50%, transparent)` }}
          >
            {book.code}
          </p>
        )}
      </div>
    </div>
  );
}
