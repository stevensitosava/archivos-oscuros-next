import type { Metadata } from "next";
import Link from "next/link";
import { freeBooks } from "@/data/books";
import { getAllBooks } from "@/lib/books-data";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";
import BookGrid from "@/components/BookGrid";
import Sigil from "@/components/Sigil";

export const metadata: Metadata = {
  title: "Libros gratis",
  description:
    "Ebooks gratuitos de estoicismo, historia y filosofía de guerreros. De vez en cuando liberamos un título completo — descárgalo mientras esté disponible.",
  alternates: { canonical: "/gratis" },
};

export default async function Gratis() {
  const free = freeBooks(await getAllBooks());

  // Machine-readable list of the free titles + breadcrumb (GEO/SEO).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Libros gratis · Archivos Oscuros",
        url: `${SITE_URL}/gratis`,
        inLanguage: "es",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: free.length,
          itemListElement: free.map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/libro/${b.slug}`,
            name: b.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Gratis", item: `${SITE_URL}/gratis` },
        ],
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <p className="eyebrow mb-3">Sin coste</p>
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)]">Libros gratis</h1>
      <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ash-400">
        De vez en cuando liberamos un título completo. Descárgalo mientras esté
        disponible — sin pagar, tuyo para siempre.
      </p>

      {free.length > 0 ? (
        <div className="mt-12">
          <BookGrid books={free} />
        </div>
      ) : (
        <div className="panel mt-12 flex flex-col items-center gap-4 p-12 text-center sm:p-16">
          <Sigil motif="moon" className="w-12 text-bone-200" weight={1.4} />
          <h2 className="text-[1.8rem]">Aún no hay libros gratis</h2>
          <p className="max-w-sm text-ash-400">
            Vuelve pronto — liberamos títulos de vez en cuando.
          </p>
          <Link href="/catalogo" className="btn btn-ember mt-2">
            Ver catálogo
          </Link>
        </div>
      )}
    </section>
  );
}
