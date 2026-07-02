/** Shimmer skeleton primitives (styles in globals.css → .skeleton). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function BookCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full rounded" />
      <Skeleton className="mt-3 h-3.5 w-3/4 rounded-sm" />
      <Skeleton className="mt-2 h-3 w-1/2 rounded-sm" />
    </div>
  );
}

/** Grid of placeholder covers matching BookGrid's responsive columns. */
export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4"
      role="status"
      aria-label="Cargando libros"
    >
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
