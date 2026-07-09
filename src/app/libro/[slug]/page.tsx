import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/types";
import { relatedTo } from "@/data/books";
import { getAllBooks, getBookBySlug } from "@/lib/books-data";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";
import ProceduralCover from "@/components/ProceduralCover";
import SectionHeading from "@/components/SectionHeading";
import BookCard from "@/components/BookCard";
import Sigil from "@/components/Sigil";
import BundlePromo from "@/components/BundlePromo";
import NewsletterCta from "@/components/NewsletterCta";
import RatingDisplay from "@/components/RatingDisplay";
import ReviewForm from "@/components/ReviewForm";
import SamplePreview from "@/components/SamplePreview";
import samples from "@/data/samples.json";
import BuyActions from "./BuyActions";

type Params = { slug: string };

export async function generateStaticParams() {
  return (await getAllBooks()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Volumen no encontrado", robots: { index: false } };
  const categoryLabel = CATEGORIES.find((c) => c.slug === book.category)?.label ?? book.category;
  return {
    title: book.title,
    description: book.tagline,
    keywords: [book.title, book.author, categoryLabel, "ebook", "PDF", "español", ...book.tags],
    alternates: { canonical: `/libro/${book.slug}` },
    openGraph: {
      // Images intentionally omitted here: the file-based opengraph-image.tsx
      // route supplies a branded 1200×630 card. Setting images here would replace
      // it with the tall cover (wrong aspect ratio for social previews).
      type: "book",
      title: `${book.title} · Archivos Oscuros`,
      description: book.tagline,
      url: `${SITE_URL}/libro/${book.slug}`,
    },
  };
}

export default async function LibroDetalle({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const categoryLabel = CATEGORIES.find((c) => c.slug === book.category)?.label ?? book.category;
  const paragraphs = book.synopsis.split("\n\n").filter(Boolean);
  const related = relatedTo(await getAllBooks(), book);
  const sampleCount = (samples as Record<string, number>)[book.slug] ?? 0;
  const chips = [book.formats.join(" · "), `${book.pages} p.`, String(book.year), book.language];

  const coverUrl = book.cover.image
    ? book.cover.image.startsWith("http")
      ? book.cover.image
      : `${SITE_URL}${book.cover.image}`
    : undefined;
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        name: book.title,
        author: { "@type": "Organization", name: book.author },
        inLanguage: "es",
        bookFormat: "https://schema.org/EBook",
        numberOfPages: book.pages,
        datePublished: String(book.year),
        description: book.tagline,
        ...(coverUrl ? { image: coverUrl } : {}),
        url: `${SITE_URL}/libro/${book.slug}`,
        publisher: { "@type": "Organization", name: "Archivos Oscuros" },
        // Only emitted once REAL verified-buyer reviews exist — never fabricated.
        ...(book.ratingCount && book.ratingCount > 0 && book.ratingAvg
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: book.ratingAvg.toFixed(1),
                reviewCount: book.ratingCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        offers: {
          "@type": "Offer",
          price: (book.priceCents / 100).toFixed(2),
          priceCurrency: book.currency,
          availability: "https://schema.org/InStock",
          priceValidUntil,
          url: `${SITE_URL}/libro/${book.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
          { "@type": "ListItem", position: 3, name: categoryLabel, item: `${SITE_URL}/catalogo?cat=${book.category}` },
          { "@type": "ListItem", position: 4, name: book.title, item: `${SITE_URL}/libro/${book.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* ───────────────── Detail ───────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* LEFT — cover */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative mx-auto w-full max-w-sm animate-rise">
              <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_70%)]" />
              <ProceduralCover book={book} priority />
            </div>
          </div>

          {/* RIGHT — info */}
          <div className="animate-rise [animation-delay:90ms]">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <Link href={`/catalogo?cat=${book.category}`} className="eyebrow transition-colors hover:text-gold-300">
                {categoryLabel}
              </Link>
              <span className="meta">{book.code}</span>
            </div>

            <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)] leading-[1.02]">{book.title}</h1>
            <p className="mt-2 text-lg italic text-ash-400">{book.author}</p>

            {/* Real verified-buyer rating (renders nothing until reviews exist) */}
            <RatingDisplay avg={book.ratingAvg} count={book.ratingCount} showValue className="mt-5 text-[1.1rem]" />
            {!book.ratingCount && (
              <p className="mt-5 text-[0.88rem] text-ash-500">Aún sin valoraciones.</p>
            )}

            {/* Meta chips */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {chips.map((chip) => (
                <span key={chip} className="rounded-md border border-bone-100/12 bg-ink-800/60 px-2.5 py-1 text-[0.72rem] uppercase tracking-[0.12em] text-ash-400" style={{ fontFamily: "var(--font-mono)" }}>
                  {chip}
                </span>
              ))}
            </div>

            {book.tagline && (
              <p className="mt-8 max-w-xl text-[1.2rem] leading-relaxed text-bone-200/85">{book.tagline}</p>
            )}

            {/* Price + actions (client) */}
            <BuyActions book={book} />

            {/* "Look inside" — paid books with extracted sample pages only */}
            {book.priceCents > 0 && sampleCount > 0 && (
              <SamplePreview book={book} pages={sampleCount} />
            )}

            {/* Bundle offers — the upsell that makes 4,99 € books add up */}
            <BundlePromo variant="strip" />

            {/* Synopsis */}
            <hr className="gold-rule my-12" />
            <h2 className="eyebrow mb-5">Sinopsis</h2>
            <div className="max-w-2xl space-y-5">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-[1.05rem] leading-relaxed text-bone-200/80" style={{ fontFamily: "var(--font-body)" }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Tags */}
            {book.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2.5">
                {book.tags.map((tag) => (
                  <Link key={tag} href={`/catalogo?q=${encodeURIComponent(tag)}`} className="rounded-md border border-gold-500/30 px-3 py-1 text-[0.78rem] uppercase tracking-[0.14em] text-gold-400/90 transition-colors hover:border-gold-400/60 hover:text-gold-300" style={{ fontFamily: "var(--font-ritual)" }}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Verified-buyer rating widget (owners only) */}
            <ReviewForm bookId={book.id} hasReviews={Boolean(book.ratingCount)} />
          </div>
        </div>
      </section>

      {/* ───────────────── Email capture ───────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <NewsletterCta source="libro" />
      </section>

      {/* ───────────────── Related ───────────────── */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <hr className="gold-rule mb-16" />
          <SectionHeading eyebrow="Más en esta senda" title="Del mismo archivo" to={`/catalogo?cat=${book.category}`} linkLabel="Ver la sección" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {related.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
