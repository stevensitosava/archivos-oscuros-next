import { Skeleton, BookGridSkeleton } from "@/components/Skeleton";

/**
 * Suspense fallback for /catalogo. The grid is a client component (uses
 * useSearchParams), so the static HTML shows this until it hydrates. The
 * header text is static/identical, so we render it for real and skeleton
 * only the count, the controls and the grid.
 */
export default function CatalogoSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <header>
        <p className="eyebrow mb-5">El archivo completo</p>
        <h1 className="text-[clamp(2.4rem,5vw,4rem)]">Catálogo</h1>
        <Skeleton className="mt-4 h-3 w-24 rounded-sm" />
      </header>

      <hr className="gold-rule my-10" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-12 w-full rounded-md lg:max-w-md" />
          <Skeleton className="h-11 w-full rounded-md lg:w-64" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>
      </div>

      <hr className="gold-rule my-10" />

      <BookGridSkeleton count={8} />
    </section>
  );
}
