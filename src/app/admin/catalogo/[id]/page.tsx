import { notFound } from "next/navigation";
import { getBookAdmin } from "@/lib/admin-data";
import { AdminHeader } from "../../ui";
import BookForm, { type FormState } from "../BookForm";

export const dynamic = "force-dynamic";

const EMPTY: FormState = {
  id: "",
  slug: "",
  title: "",
  author: "Archivos Oscuros",
  category: "guerreros",
  priceCents: 0,
  currency: "EUR",
  tagline: "",
  synopsis: "",
  pages: 0,
  year: 2026,
  language: "Español",
  tags: [],
  formats: ["EPUB", "PDF"],
  coverMotif: "skull",
  coverImage: "",
  stripePriceId: "",
  storagePath: "",
  featured: false,
  rating: 0,
  sortOrder: 0,
  published: true,
};

export default async function EditBook({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  let initial = EMPTY;

  if (!isNew) {
    const row = await getBookAdmin(id);
    if (!row) notFound();
    initial = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      author: row.author,
      category: row.category,
      priceCents: row.price_cents ?? 0,
      currency: row.currency ?? "EUR",
      tagline: row.tagline ?? "",
      synopsis: row.synopsis ?? "",
      pages: row.pages ?? 0,
      year: row.year ?? 2026,
      language: row.language ?? "Español",
      tags: row.tags ?? [],
      formats: row.formats ?? [],
      coverMotif: row.cover_motif ?? "skull",
      coverImage: row.cover_image ?? "",
      stripePriceId: row.stripe_price_id ?? "",
      storagePath: row.storage_path ?? "",
      featured: Boolean(row.featured),
      rating: Number(row.rating ?? 0),
      sortOrder: row.sort_order ?? 0,
      published: Boolean(row.published),
    };
  }

  return (
    <>
      <AdminHeader eyebrow="Catálogo" title={isNew ? "Nuevo libro" : initial.title || "Editar libro"} />
      <BookForm mode={isNew ? "create" : "update"} originalId={isNew ? "" : id} initial={initial} />
    </>
  );
}
