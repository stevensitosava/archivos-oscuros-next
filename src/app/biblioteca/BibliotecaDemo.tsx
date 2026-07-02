"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Book } from "@/types";
import { findById } from "@/data/books";
import { useBooks } from "@/components/BooksProvider";
import { readDemoOwned } from "@/lib/demo-library";
import LibraryGrid from "@/components/LibraryGrid";
import Sigil from "@/components/Sigil";

/** Demo library — reads owned book ids from localStorage. */
export default function BibliotecaDemo() {
  const allBooks = useBooks();
  const [books, setBooks] = useState<Book[] | null>(null);

  useEffect(() => {
    const owned = readDemoOwned()
      .map((id) => findById(allBooks, id))
      .filter((b): b is Book => Boolean(b));
    setBooks(owned);
  }, [allBooks]);

  if (books === null) return <section className="min-h-[60vh]" />; // avoid hydration flash

  return <LibraryShell books={books} />;
}

export function LibraryShell({ books }: { books: Book[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow mb-3">Tu colección</p>
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)]">Mi Biblioteca</h1>
      <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ash-400">
        Tus libros, tuyos para siempre. Descárgalos cuando quieras.
      </p>

      {books.length > 0 ? (
        <div className="mt-12">
          <LibraryGrid books={books} />
        </div>
      ) : (
        <div className="panel mt-12 flex flex-col items-center gap-4 p-12 text-center sm:p-16">
          <Sigil motif="moon" className="w-12 text-bone-200" weight={1.4} />
          <h2 className="text-[1.8rem]">Tu biblioteca está vacía</h2>
          <p className="max-w-sm text-ash-400">
            Cuando compres un título aparecerá aquí con descarga inmediata.
          </p>
          <Link href="/catalogo" className="btn btn-ember mt-2">
            Explorar el catálogo
          </Link>
        </div>
      )}
    </section>
  );
}
