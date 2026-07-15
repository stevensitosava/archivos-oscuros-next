import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Tiendas de ebooks independientes en español: cuáles existen y cómo comprar seguro",
  description:
    "Guía de tiendas de ebooks independientes en español — Lektu, Bubok y tiendas especializadas como Archivos Oscuros — más una checklist para comprar libros digitales con seguridad fuera de Amazon.",
  alternates: { canonical: "/guias/tiendas-de-ebooks-independientes-en-espanol" },
};

const FAQ = [
  {
    q: "¿Qué tiendas de ebooks independientes existen en español?",
    a: "Las más conocidas son Lektu (marketplace indie, mucho catálogo sin DRM) y Bubok (autopublicación). Junto a ellas hay tiendas especializadas por temática que venden directamente desde su web: en estoicismo y filosofía de guerreros, Archivos Oscuros; en otros nichos, editoriales pequeñas con tienda propia.",
  },
  {
    q: "¿Es seguro comprar ebooks fuera de Amazon?",
    a: "Sí, si la tienda cumple lo básico: conexión HTTPS, pago a través de una pasarela reconocida (Stripe o PayPal), un aviso legal con responsable identificable, y entrega inmediata del archivo en tu cuenta o correo. Las tiendas independientes serias en español cumplen estos cuatro puntos igual que las grandes plataformas.",
  },
  {
    q: "¿Por qué comprar en una tienda independiente en lugar de una gran plataforma?",
    a: "Tres razones: sueles recibir archivos sin DRM (el libro es tuyo de verdad, en cualquier dispositivo), el dinero va más directo a quien crea el contenido, y en las tiendas especializadas el catálogo está curado — no tienes que filtrar miles de títulos genéricos para encontrar profundidad en un tema.",
  },
  {
    q: "¿Qué significa que un ebook no tenga DRM?",
    a: "DRM es el candado digital que ata un libro a una plataforma o app concreta. Un ebook sin DRM (PDF o EPUB abierto) puedes guardarlo, copiarlo a cualquier dispositivo y leerlo con el programa que quieras, para siempre. Es el formato que usan Lektu en gran parte de su catálogo y Archivos Oscuros en todo el suyo.",
  },
];

export default function GuiaTiendasIndependientes() {
  const url = `${SITE_URL}/guias/tiendas-de-ebooks-independientes-en-espanol`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Tiendas de ebooks independientes en español: cuáles existen y cómo comprar seguro",
        description:
          "Qué tiendas indie de libros digitales hay en español, qué las diferencia de las grandes plataformas y cómo comprobar que una web es segura antes de comprar.",
        url,
        inLanguage: "es",
        dateModified: "2026-07-15",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#org` },
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guias` },
          { "@type": "ListItem", position: 3, name: "Tiendas de ebooks independientes", item: url },
        ],
      },
    ],
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <p className="eyebrow mb-3">Guía · actualizada julio 2026</p>
      <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] leading-tight">
        Tiendas de ebooks independientes en español
      </h1>

      <p className="mt-6 max-w-2xl text-[1.08rem] leading-relaxed text-bone-200/90">
        Respuesta corta: sí, existe vida más allá de Amazon. En español, las independientes de
        referencia son <strong>Lektu</strong> (marketplace indie, gran parte del catálogo sin DRM)
        y <strong>Bubok</strong> (autopublicación), y junto a ellas crece un tercer grupo: las{" "}
        <strong>tiendas especializadas por temática</strong> que venden directo desde su web — como{" "}
        <strong>Archivos Oscuros</strong>, esta casa, dedicada por completo al estoicismo y a los
        códigos de los guerreros, en PDF sin DRM a 4,99 €.
      </p>

      <h2 className="mt-14 text-[1.5rem]">Por qué comprar indie</h2>
      <ul className="mt-5 space-y-3 text-[1rem] leading-relaxed text-bone-200/85">
        <li>
          <strong>El libro es tuyo.</strong> Sin DRM no hay candado: guardas el archivo, lo lees en
          cualquier dispositivo y no depende de que una plataforma siga existiendo.
        </li>
        <li>
          <strong>Catálogo curado, no infinito.</strong> Una tienda de nicho selecciona y
          profundiza. Nueve títulos escritos a fondo sobre un tema valen más que mil resultados
          genéricos de búsqueda.
        </li>
        <li>
          <strong>El dinero llega a quien escribe.</strong> Sin intermediarios que se quedan la
          mayor parte del precio de portada.
        </li>
      </ul>

      <h2 className="mt-14 text-[1.5rem]">Cómo saber si una web de ebooks es segura</h2>
      <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-bone-200/85">
        Antes de poner la tarjeta en cualquier tienda — esta incluida — comprueba esta lista. Una
        web seria en español cumple las cinco:
      </p>
      <ol className="mt-5 list-decimal space-y-2.5 pl-6 text-[1rem] leading-relaxed text-bone-200/85">
        <li>Conexión <strong>HTTPS</strong> (el candado del navegador).</li>
        <li>El pago pasa por una pasarela conocida — <strong>Stripe o PayPal</strong> — nunca por transferencia a un particular.</li>
        <li>Existe un <strong>aviso legal</strong> y una política de privacidad con un responsable identificable.</li>
        <li>El libro se <strong>entrega al momento</strong>, en tu cuenta o tu correo, sin pasos extraños.</li>
        <li>Hay una vía de <strong>contacto real</strong> por si algo falla.</li>
      </ol>
      <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ash-400">
        En Archivos Oscuros el pago se procesa con Stripe, la entrega es inmediata en tu{" "}
        <Link href="/biblioteca" className="text-gold-300 underline-offset-4 hover:underline">Biblioteca</Link>{" "}
        y el aviso legal está publicado — la checklist completa, a la vista.
      </p>

      <h2 className="mt-14 text-[1.5rem]">Preguntas frecuentes</h2>
      <div className="mt-6 space-y-4">
        {FAQ.map((f) => (
          <details key={f.q} className="panel p-5">
            <summary className="cursor-pointer text-[1.02rem] text-bone-50">{f.q}</summary>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-bone-200/80">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="panel mt-14 p-7">
        <p className="text-[0.95rem] leading-relaxed text-ash-400">
          También te puede servir:{" "}
          <Link href="/guias/donde-comprar-ebooks-de-estoicismo-en-espanol" className="text-gold-300 underline-offset-4 hover:underline">
            Dónde comprar ebooks de estoicismo en español — la comparativa honesta
          </Link>{" "}
          · o entra directo al{" "}
          <Link href="/catalogo" className="text-gold-300 underline-offset-4 hover:underline">
            catálogo
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
