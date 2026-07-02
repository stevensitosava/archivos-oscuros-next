import type { Metadata } from "next";
import Link from "next/link";
import Sigil from "@/components/Sigil";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <Sigil motif="eye" className="w-20 text-ember-500 animate-flicker" weight={1.4} />
      <p className="eyebrow mt-8">Error 404</p>
      <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)]">Este archivo no existe</h1>
      <p className="mt-5 max-w-md text-[1.05rem] text-ash-400">
        La página que buscas se ha perdido en la oscuridad… o nunca estuvo aquí.
      </p>
      <div className="mt-9 flex gap-4">
        <Link href="/" className="btn btn-ember">Volver al inicio</Link>
        <Link href="/catalogo" className="btn btn-ghost">Ir al catálogo</Link>
      </div>
    </section>
  );
}
