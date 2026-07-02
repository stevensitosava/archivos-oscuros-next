import type { Book } from "../types";
import BookCard from "./BookCard";

interface BookGridProps {
  books: Book[];
  className?: string;
}

/** Responsive catalog grid: 2 cols (mobile) → 3 → 4 (desktop). */
export default function BookGrid({ books, className = "" }: BookGridProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 ${className}`}
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
