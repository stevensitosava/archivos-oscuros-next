import { Reveal } from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { safeJsonLd } from "@/lib/jsonld";

/* Frequently-asked questions. The visible Q&A and the FAQPage JSON-LD are the
   SAME content (Google requires parity), and the plain, factual answers are
   exactly what AI answer engines quote. Keep answers accurate to the store. */
const FAQS: { q: string; a: string }[] = [
  {
    q: "¿En qué formato están los libros?",
    a: "Todos los libros son PDF en español. Se leen en móvil, tablet, ordenador o e-reader, sin apps ni registros complicados.",
  },
  {
    q: "¿Cómo recibo mi libro después de comprarlo?",
    a: "La descarga es inmediata. En cuanto se confirma el pago, el libro queda disponible en tu Biblioteca y recibes un correo de confirmación. Es tuyo para siempre y puedes volver a descargarlo cuando quieras.",
  },
  {
    q: "¿El pago es seguro?",
    a: "Sí. Los pagos se procesan de forma cifrada con Stripe. Los datos de tu tarjeta nunca pasan por nuestros servidores.",
  },
  {
    q: "¿Hay algún libro gratis?",
    a: "Sí. «El Código del Guerrero» es gratuito: solo necesitas crear una cuenta para descargarlo.",
  },
  {
    q: "¿Puedo comprar varios libros y ahorrar?",
    a: "Sí. El descuento se aplica solo en el carrito: llévate 3 libros por 9,99 € o 5 por 14,99 €, sin códigos ni pasos extra.",
  },
  {
    q: "¿Sobre qué tratan los libros?",
    a: "Estoicismo (Marco Aurelio, Séneca, Epicteto), historia militar y los códigos de los grandes guerreros: samuráis, vikingos, Esparta y las legiones de Roma. Sabiduría práctica para forjar disciplina y carácter.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <Reveal>
        <SectionHeading eyebrow="Dudas" title="Preguntas frecuentes" />
      </Reveal>
      <dl className="mt-10 divide-y divide-bone-100/10">
        {FAQS.map((f) => (
          <Reveal key={f.q}>
            <div className="py-6">
              <dt className="text-[1.15rem] font-medium text-bone-50">{f.q}</dt>
              <dd className="mt-2 text-[0.98rem] leading-relaxed text-ash-400">{f.a}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
