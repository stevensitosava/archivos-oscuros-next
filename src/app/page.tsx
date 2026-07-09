import type { Metadata } from "next";
import { getAllBooks } from "@/lib/books-data";
import Hero from "@/components/Hero";
import { Reveal, StaggerGrid } from "@/components/Reveal";
import ProductShowcase from "@/components/ProductShowcase";
import BundlePromo from "@/components/BundlePromo";
import FaqSection from "@/components/FaqSection";
import CategoryReveal from "@/components/CategoryReveal";
import DualWave from "@/components/DualWave";
import NewsletterCta from "@/components/NewsletterCta";
import SectionHeading from "@/components/SectionHeading";
import Sigil from "@/components/Sigil";

export const metadata: Metadata = {
  description:
    "Ebooks de estoicismo, historia y filosofía de guerreros — samuráis, vikingos, Esparta, Roma y los estoicos. Descarga inmediata para forjar el carácter.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const books = await getAllBooks();

  return (
    <>
      {/* ───────────────── Cinematic hero ───────────────── */}
      <Hero />

      {/* ───────────────── Product showcase ───────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="El archivo"
            title="Lecturas que templan"
            to="/catalogo"
            linkLabel="Ver catálogo"
          />
        </Reveal>
        <ProductShowcase books={books} />
      </section>

      {/* ───────────────── Offers ───────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <Reveal>
          <BundlePromo />
        </Reveal>
      </section>

      {/* ───────────────── Disciplines (interactive reveal · hover/18) ───────────────── */}
      <CategoryReveal />

      {/* ───────────────── Email capture (second net for the not-ready) ───────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <NewsletterCta source="home-mid" />
        </Reveal>
      </section>

      {/* ───────────────── Dual-wave book index (scroll/31) ───────────────── */}
      <DualWave books={books} />

      {/* ───────────────── Delivery band ───────────────── */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <StaggerGrid className="grid gap-8 border-y border-bone-100/10 py-14 sm:grid-cols-3">
          {[
            ["candle", "Entrega inmediata", "Descarga el PDF en cuanto se confirma el pago. Sin esperas, sin envíos."],
            ["key", "Pago seguro", "Checkout cifrado con Stripe. Tus datos nunca tocan nuestros servidores."],
            ["moon", "Tuyo para siempre", "Cada compra queda en tu Biblioteca. Vuelve a descargarla cuando quieras."],
          ].map(([motif, title, body]) => (
            <div key={title} className="flex gap-4">
              <Sigil motif={motif as Parameters<typeof Sigil>[0]["motif"]} className="mt-1 w-8 shrink-0 text-bone-200" weight={1.6} />
              <div>
                <h3 className="text-[1.3rem] text-bone-50">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ash-400">{body}</p>
              </div>
            </div>
          ))}
        </StaggerGrid>
      </section>

      {/* ───────────────── FAQ (SEO + GEO: citable Q&A + FAQPage schema) ───────────────── */}
      <FaqSection />
    </>
  );
}
