"use server";

import { z } from "zod";
import { updateTag, revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-server";
import { BOOKS_TAG } from "@/lib/books-data";
import { createBook, updateBook, deleteBook, type BookInput } from "@/lib/admin-books";

const MOTIFS = ["eye", "moon", "serpent", "skull", "pentacle", "key", "candle", "hand"] as const;
const CATS = ["estoicismo", "guerreros", "historia", "filosofia"] as const;
const FORMATS = ["EPUB", "PDF", "MOBI"] as const;

const optStr = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).transform((v) => (v && v.length ? v : null));

const Schema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{1,64}$/, "ID inválido (minúsculas, números y guiones)"),
  slug: z.string().trim().regex(/^[a-z0-9-]{1,80}$/, "Slug inválido (minúsculas, números y guiones)"),
  title: z.string().trim().min(1, "El título es obligatorio").max(160),
  author: z.string().trim().min(1).max(120),
  category: z.enum(CATS),
  priceCents: z.number().int().min(0).max(1_000_000),
  currency: z.literal("EUR"),
  tagline: z.string().trim().max(300),
  synopsis: z.string().trim().max(8000),
  pages: z.number().int().min(0).max(20000),
  year: z.number().int().min(0).max(3000),
  language: z.string().trim().min(1).max(40),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  formats: z.array(z.enum(FORMATS)).max(3),
  coverMotif: z.enum(MOTIFS),
  coverImage: optStr(400),
  stripePriceId: optStr(120),
  storagePath: optStr(300),
  featured: z.boolean(),
  rating: z.number().min(0).max(5),
  sortOrder: z.number().int().min(0).max(100000),
  published: z.boolean(),
});

export type BookFormValues = z.input<typeof Schema>;

function revalidateBooks() {
  updateTag(BOOKS_TAG); // busts the unstable_cache books tag (read-your-own-writes)
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/gratis");
  revalidatePath("/admin/catalogo");
}

export async function saveBook(
  mode: "create" | "update",
  originalId: string,
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "No autorizado." };
  }
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const book = parsed.data as BookInput;
  const res = mode === "create" ? await createBook(book) : await updateBook(originalId, book);
  if (!res.ok) return res;
  revalidateBooks();
  return { ok: true, error: res.error };
}

export async function removeBook(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "No autorizado." };
  }
  if (!/^[a-z0-9-]{1,64}$/.test(id)) return { ok: false, error: "ID inválido." };
  const res = await deleteBook(id);
  if (res.ok) revalidateBooks();
  return res;
}
