import type { Metadata } from "next";
import type { Book } from "@/types";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserId } from "@/lib/auth-server";
import { getOwnedBookIds } from "@/lib/db";
import { findById } from "@/data/books";
import { getAllBooks } from "@/lib/books-data";
import BibliotecaDemo, { LibraryShell } from "./BibliotecaDemo";

export const metadata: Metadata = { title: "Mi Biblioteca", robots: { index: false } };
export const dynamic = "force-dynamic"; // per-user, never statically cached

export default async function Biblioteca() {
  // Demo mode (no Supabase): localStorage-backed library on the client.
  if (!isSupabaseConfigured) {
    return <BibliotecaDemo />;
  }

  // Real mode: this route is sign-in protected (proxy), so a user id exists.
  const userId = await getUserId();
  const ownedIds = userId ? await getOwnedBookIds(userId) : [];
  const allBooks = await getAllBooks();
  const books = ownedIds
    .map((id) => findById(allBooks, id))
    .filter((b): b is Book => Boolean(b));

  return <LibraryShell books={books} />;
}
