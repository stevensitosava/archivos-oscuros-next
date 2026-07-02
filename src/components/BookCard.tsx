import Link from "next/link";
import type { Book } from "../types";
import { CATEGORIES } from "../types";
import ProceduralCover from "./ProceduralCover";
import Price from "./Price";
import RatingStars from "./RatingStars";
import AddToCartButton from "./AddToCartButton";

interface BookCardProps {
  book: Book;
  className?: string;
}

const labelFor = (slug: Book["category"]) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

/** Catalog/rail card: cover, category, title, author, rating, price, add-to-cart. */
export default function BookCard({ book, className = "" }: BookCardProps) {
  const onSale = typeof book.originalPriceCents === "number" && book.originalPriceCents > book.priceCents;
  const pctOff = onSale ? Math.round((1 - book.priceCents / book.originalPriceCents!) * 100) : 0;
  return (
    <article className={`group flex h-full flex-col ${className}`}>
      <Link
        href={`/libro/${book.slug}`}
        className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1"
        aria-label={`Ver ${book.title}`}
      >
        <div className="relative">
          <ProceduralCover book={book} className="transition-shadow duration-300 group-hover:shadow-[0_30px_70px_-24px_rgba(0,0,0,0.9)]" />
          <span
            className="absolute left-3 top-3 rounded-[2px] px-2 py-1 backdrop-blur-sm"
            style={{ background: "color-mix(in srgb, var(--color-ink-950) 70%, transparent)" }}
          >
            <span className="meta text-gold-400" style={{ fontFamily: "var(--font-mono)" }}>
              {labelFor(book.category)}
            </span>
          </span>
          {onSale && (
            <span
              className="absolute right-3 top-3 rounded-full bg-ember-500 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-wide text-white shadow-[0_2px_12px_rgba(178,52,42,0.5)]"
              style={{ fontFamily: "var(--font-ritual)" }}
            >
              −{pctOff}%
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/libro/${book.slug}`}>
          <h3 className="text-[1.35rem] leading-tight text-bone-50 transition-colors duration-200 group-hover:text-gold-300">
            {book.title}
          </h3>
        </Link>
        <p className="mt-0.5 text-[0.95rem] italic text-ash-400">{book.author}</p>

        <div className="mt-2 flex items-center gap-3">
          <RatingStars rating={book.rating} className="text-[0.8rem]" />
        </div>

        <p className="mt-3 line-clamp-2 text-[0.95rem] text-bone-200/80">{book.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
          <Price cents={book.priceCents} originalCents={book.originalPriceCents} currency={book.currency} className="text-base" />
          <AddToCartButton bookId={book.id} />
        </div>
      </div>
    </article>
  );
}
