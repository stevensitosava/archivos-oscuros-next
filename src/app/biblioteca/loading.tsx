import { Skeleton, BookGridSkeleton } from "@/components/Skeleton";

/** Shown while the per-user library (force-dynamic) is fetched server-side. */
export default function BibliotecaLoading() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <p className="eyebrow mb-3">Tu colección</p>
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)]">Mi Biblioteca</h1>
      <Skeleton className="mt-4 h-4 w-72 max-w-full rounded-sm" />
      <div className="mt-12">
        <BookGridSkeleton count={8} />
      </div>
    </section>
  );
}
