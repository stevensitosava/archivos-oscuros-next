import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Pago cancelado", robots: { index: false } };
export default function CompraCancelada() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Pago cancelado</p>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)]">No se ha completado el pago</h1>
      <p className="mt-5 text-ash-400">Tu carrito sigue intacto. Puedes intentarlo de nuevo cuando quieras.</p>
      <Link href="/carrito" className="btn btn-ember mt-8">Volver al carrito</Link>
    </section>
  );
}
