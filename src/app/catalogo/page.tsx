import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogoClient from "./CatalogoClient";
import CatalogoSkeleton from "@/components/CatalogoSkeleton";
import { getAllBooks } from "@/lib/books-data";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo completo de Archivos Oscuros: ebooks de estoicismo, historia y filosofía de guerreros. Busca, filtra por disciplina y descarga al instante.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogoPage() {
  const books = await getAllBooks();

  // Machine-readable catalog: a CollectionPage whose ItemList enumerates every
  // book as a Product/Offer. Server-rendered so crawlers and AI engines get the
  // full list without executing the client-filtered grid.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Catálogo · Archivos Oscuros",
        url: `${SITE_URL}/catalogo`,
        inLanguage: "es",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: books.length,
          itemListElement: books.map((b, i) => ({
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
          { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <Suspense fallback={<CatalogoSkeleton />}>
        <CatalogoClient />
      </Suspense>
    </>
  );
}
