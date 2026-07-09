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

      {/* Why the account gate exists — spell out the value exchange BEFORE the
          sign-in wall so it doesn't read as an arbitrary hoop. */}
      <div className="panel mt-10 grid max-w-4xl grid-cols-1 gap-6 p-6 sm:grid-cols-3 sm:p-7">
        {[
          ["key", "1 · Crea tu cuenta gratis", "Un minuto, sin tarjeta. Solo tu correo."],
          ["candle", "2 · Descarga el PDF", "Directo a tu dispositivo, completo y sin marcas."],
          ["moon", "3 · Tuyo para siempre", "Queda en tu Biblioteca — y los próximos gratuitos llegan primero a quienes están dentro."],
        ].map(([motif, title, body]) => (
          <div key={title} className="flex gap-3.5">
            <Sigil motif={motif as Parameters<typeof Sigil>[0]["motif"]} className="mt-0.5 w-6 shrink-0 text-gold-400" weight={1.6} />
            <div>
              <h2 className="text-[1.02rem] leading-snug text-bone-50">{title}</h2>
              <p className="mt-1 text-[0.88rem] leading-relaxed text-ash-400">{body}</p>
            </div>
          </div>
        ))}
      </div>

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
