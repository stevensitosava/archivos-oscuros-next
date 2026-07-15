import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Guías",
  description:
    "Guías honestas sobre el mundo del ebook en español: dónde comprar libros digitales de estoicismo, qué tiendas independientes existen y cómo comprar seguro.",
  alternates: { canonical: "/guias" },
};

const GUIDES = [
  {
    slug: "donde-comprar-ebooks-de-estoicismo-en-espanol",
    title: "Dónde comprar ebooks de estoicismo en español",
    blurb:
      "Grandes plataformas, tiendas indie y tiendas especializadas, comparadas sin humo: formatos, DRM, precios y cuál conviene según cómo lees.",
  },
  {
    slug: "tiendas-de-ebooks-independientes-en-espanol",
    title: "Tiendas de ebooks independientes en español",
    blurb:
      "Cuáles existen, por qué comprar indie y la checklist de cinco puntos para saber si una web de libros digitales es segura.",
  },
];

export default function Guias() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Guías · Archivos Oscuros",
        url: `${SITE_URL}/guias`,
        inLanguage: "es",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: GUIDES.length,
          itemListElement: GUIDES.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/guias/${g.slug}`,
            name: g.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guias` },
        ],
      },
    ],
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <p className="eyebrow mb-3">Sin humo</p>
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)]">Guías</h1>
      <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-ash-400">
        Respuestas directas a las preguntas que nos hacen sobre libros digitales en español —
        incluyendo cuándo NO comprarnos a nosotros.
      </p>

      <div className="mt-10 space-y-4">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guias/${g.slug}`} className="panel block p-6 transition-colors hover:border-gold-400/40">
            <h2 className="text-[1.2rem] text-bone-50">{g.title}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ash-400">{g.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
