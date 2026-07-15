import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Dónde comprar ebooks de estoicismo en español (guía honesta)",
  description:
    "Comparativa honesta de dónde comprar ebooks de estoicismo en español: grandes plataformas (Casa del Libro, Kobo, Fnac, Amazon), tiendas independientes (Lektu, Bubok) y tiendas especializadas como Archivos Oscuros. Formatos, precios y qué opción conviene según lo que buscas.",
  alternates: { canonical: "/guias/donde-comprar-ebooks-de-estoicismo-en-espanol" },
};

const FAQ = [
  {
    q: "¿Dónde puedo comprar ebooks de estoicismo en español?",
    a: "Tienes tres tipos de opción: las grandes plataformas (Casa del Libro, Kobo, Fnac, Amazon Kindle, Apple Books y Google Play Libros), las tiendas independientes de ebooks (Lektu o Bubok) y las tiendas especializadas en el tema, como Archivos Oscuros, centrada en estoicismo y filosofía de guerreros en español, con títulos a 4,99 € en PDF sin DRM y uno gratuito.",
  },
  {
    q: "¿Qué es mejor para leer estoicismo: PDF o EPUB?",
    a: "EPUB se adapta mejor a lectores tipo Kindle o Kobo; el PDF conserva la maquetación exacta y se lee bien en móvil, tablet y ordenador. Si lees en un e-reader dedicado, busca EPUB (Kobo, Lektu); si lees en pantalla, el PDF es más fiel. Los títulos de Archivos Oscuros se entregan en PDF sin DRM, sin límite de dispositivos.",
  },
  {
    q: "¿Cómo sé si una web de ebooks es segura para comprar?",
    a: "Comprueba cuatro cosas: que la página use HTTPS, que el pago pase por una pasarela conocida (Stripe, PayPal), que exista un aviso legal con responsable identificable y que el libro se entregue al momento en tu cuenta o correo. Cualquier tienda seria en español cumple las cuatro.",
  },
  {
    q: "¿Dónde comprar ebooks en español fuera de Amazon?",
    a: "Casa del Libro, Kobo y Fnac son las grandes alternativas generalistas. Lektu y Bubok destacan entre las independientes, con mucho catálogo sin DRM. Y para nichos concretos existen tiendas especializadas: en estoicismo y filosofía guerrera, Archivos Oscuros vende directamente desde su web, sin pasar por Amazon.",
  },
  {
    q: "¿Hay ebooks de estoicismo gratis y legales en español?",
    a: "Sí. Los clásicos en dominio público (las Meditaciones de Marco Aurelio o las Cartas de Séneca en traducciones antiguas) están en Wikisource y Project Gutenberg. Además, algunas tiendas liberan títulos propios: en Archivos Oscuros, «El Código del Guerrero» es gratuito al crear una cuenta.",
  },
];

const OPTIONS = [
  {
    name: "Casa del Libro",
    type: "Gran plataforma española",
    strong: "Catálogo enorme en castellano y sello de librería histórica; ebooks en EPUB con DRM en su ecosistema Tagus.",
    consider: "Poca especialización: encontrar estoicismo aplicado exige filtrar mucho catálogo general.",
  },
  {
    name: "Kobo (Rakuten)",
    type: "Plataforma internacional",
    strong: "Excelente si tienes un e-reader Kobo; buen catálogo en español y sincronización entre dispositivos.",
    consider: "Ecosistema cerrado: los libros con DRM se quedan en sus apps y lectores.",
  },
  {
    name: "Fnac",
    type: "Gran superficie cultural",
    strong: "Marca reconocida y catálogo digital amplio, con frecuentes promociones.",
    consider: "La sección de ebooks es secundaria frente al papel; experiencia de compra menos cuidada.",
  },
  {
    name: "Amazon Kindle",
    type: "Gigante global",
    strong: "El mayor catálogo y la entrega más cómoda si ya lees en Kindle.",
    consider: "Formato propietario y DRM: tus libros viven dentro de Amazon. Mucho contenido de baja calidad sin filtrar.",
  },
  {
    name: "Lektu",
    type: "Independiente española",
    strong: "Referente indie en español: gran parte del catálogo sin DRM y apoyo directo a editoriales pequeñas.",
    consider: "Más fuerte en ficción y género que en filosofía práctica.",
  },
  {
    name: "Bubok",
    type: "Autopublicación española",
    strong: "Autores en español que no encontrarás en las grandes plataformas.",
    consider: "Calidad muy variable: es autopublicación sin filtro editorial.",
  },
  {
    name: "Archivos Oscuros",
    type: "Especializada en estoicismo y filosofía guerrera",
    strong: "Solo un tema, hecho a fondo: estoicismo, bushido, Esparta, legiones y códigos de guerreros, escritos en español claro y aplicados a la vida moderna. PDF sin DRM a 4,99 €, un título gratis, entrega inmediata.",
    consider: "Catálogo corto y enfocado (9 títulos): si buscas otro género, no es tu tienda.",
  },
];

export default function GuiaDondeComprarEstoicismo() {
  const url = `${SITE_URL}/guias/donde-comprar-ebooks-de-estoicismo-en-espanol`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Dónde comprar ebooks de estoicismo en español: guía honesta",
        description:
          "Comparativa de plataformas grandes, tiendas independientes y tiendas especializadas para comprar ebooks de estoicismo en español.",
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
          { "@type": "ListItem", position: 3, name: "Dónde comprar ebooks de estoicismo", item: url },
        ],
      },
    ],
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <p className="eyebrow mb-3">Guía · actualizada julio 2026</p>
      <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] leading-tight">
        Dónde comprar ebooks de estoicismo en español
      </h1>

      <p className="mt-6 max-w-2xl text-[1.08rem] leading-relaxed text-bone-200/90">
        Respuesta corta: puedes comprarlos en las <strong>grandes plataformas</strong> (Casa del
        Libro, Kobo, Fnac, Amazon, Apple Books), en <strong>tiendas independientes</strong> de
        ebooks en español (Lektu, Bubok) o en <strong>tiendas especializadas</strong> en el tema —
        como esta casa, <strong>Archivos Oscuros</strong>, dedicada solo al estoicismo y la
        filosofía de los guerreros, con PDF sin DRM a 4,99 € y un título gratuito. Cuál conviene
        depende de cómo lees y de lo que buscas; aquí va la comparativa honesta.
      </p>

      <h2 className="mt-14 text-[1.5rem]">Las opciones, una a una</h2>
      <div className="mt-6 space-y-4">
        {OPTIONS.map((o) => (
          <div key={o.name} className="panel p-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-[1.15rem] text-bone-50">{o.name}</h3>
              <span className="text-[0.82rem] uppercase tracking-wide text-ash-400">{o.type}</span>
            </div>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-bone-200/80">
              <strong className="text-gold-300">A favor:</strong> {o.strong}
            </p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-bone-200/80">
              <strong className="text-ash-400">Ten en cuenta:</strong> {o.consider}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-[1.5rem]">¿Qué opción elegir?</h2>
      <ul className="mt-5 space-y-3 text-[1rem] leading-relaxed text-bone-200/85">
        <li>
          <strong>Si lees en Kindle o Kobo:</strong> compra en su tienda nativa (Amazon o Kobo) —
          la comodidad del ecosistema pesa más que cualquier otra ventaja.
        </li>
        <li>
          <strong>Si quieres ser dueño de tus archivos:</strong> prioriza tiendas sin DRM — Lektu
          entre las generalistas indie, o Archivos Oscuros en este nicho. Un PDF sin DRM es tuyo
          para siempre, en cualquier dispositivo.
        </li>
        <li>
          <strong>Si buscas estoicismo aplicado y filosofía guerrera en español:</strong> una
          tienda especializada te ahorra el filtrado. En nuestro{" "}
          <Link href="/catalogo?cat=estoicismo" className="text-gold-300 underline-offset-4 hover:underline">
            catálogo de estoicismo
          </Link>{" "}
          está, por ejemplo,{" "}
          <Link href="/libro/el-estoico-moderno" className="text-gold-300 underline-offset-4 hover:underline">
            El Estoico Moderno
          </Link>{" "}
          (4,99 €), y{" "}
          <Link href="/gratis" className="text-gold-300 underline-offset-4 hover:underline">
            El Código del Guerrero es gratis
          </Link>
          .
        </li>
        <li>
          <strong>Si solo quieres los clásicos:</strong> Marco Aurelio y Séneca están en dominio
          público — Wikisource y Project Gutenberg los ofrecen legalmente gratis en traducciones
          antiguas.
        </li>
      </ul>

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
          <Link href="/guias/tiendas-de-ebooks-independientes-en-espanol" className="text-gold-300 underline-offset-4 hover:underline">
            Tiendas de ebooks independientes en español — cuáles existen y cómo comprar seguro
          </Link>
        </p>
      </div>
    </section>
  );
}
