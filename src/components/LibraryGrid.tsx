import Link from "next/link";
import type { Book } from "@/types";
import ProceduralCover from "./ProceduralCover";

/**
 * Owned-books grid for the library. Presentational (no hooks) so it renders
 * in both the server (real DB) and client (demo localStorage) paths. Each
 * download links to /api/download, which serves the public sample in demo
 * mode or an entitlement-gated signed URL in real mode.
 */
export default function LibraryGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
      {books.map((book) => (
        <div key={book.id} className="flex flex-col">
          <Link href={`/libro/${book.slug}`} className="block transition-transform duration-300 hover:-translate-y-0.5">
            <ProceduralCover book={book} />
          </Link>
          <h3 className="mt-3 text-[1.02rem] leading-tight text-bone-50" style={{ fontFamily: "var(--font-display)" }}>
            {book.title}
          </h3>
          <p className="meta mt-1">{book.formats.join(" · ")}</p>
          <a
            href={`/api/download?book=${book.id}`}
            target="_blank"
            rel="noopener"
            className="btn btn-ember mt-3 w-full !py-2.5 text-[0.7rem]"
          >
            Descargar
          </a>
        </div>
      ))}
    </div>
  );
}
