"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Route-level error boundary — graceful fallback instead of a blank screen. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console (and any monitoring) — never swallow silently.
    console.error("[app error]", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Algo se ha roto</p>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)]">Un fallo en la oscuridad</h1>
      <p className="mt-4 text-ash-400">
        Ha ocurrido un error inesperado. Puedes reintentar o volver a la tienda.
      </p>
      {error.digest && <p className="meta mt-3 text-ash-600">ref: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-ember">
          Reintentar
        </button>
        <Link href="/" className="btn btn-ghost">
          Volver a la tienda
        </Link>
      </div>
    </section>
  );
}
