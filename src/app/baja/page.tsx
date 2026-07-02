import type { Metadata } from "next";
import Link from "next/link";
import { verifyUnsubscribe } from "@/lib/unsubscribe";
import { unsubscribeEmail } from "@/lib/db";
import Sigil from "@/components/Sigil";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Darse de baja",
  robots: { index: false, follow: false },
};

/**
 * One-click unsubscribe target. The link carries the email + an HMAC token; a
 * valid token flips the subscriber to `unsubscribed`. GET side-effect is standard
 * for List-Unsubscribe links and is idempotent.
 */
export default async function BajaPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e, t } = await searchParams;
  const email = (e ?? "").trim();
  const valid = Boolean(email && t && verifyUnsubscribe(email, t));
  const done = valid ? await unsubscribeEmail(email) : false;

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-20 text-center">
      <Sigil motif={done ? "candle" : "eye"} className="w-12 text-gold-400" weight={1.5} />
      {done ? (
        <>
          <h1 className="mt-6 text-[clamp(1.8rem,3vw,2.4rem)]">Te has dado de baja</h1>
          <p className="mt-3 leading-relaxed text-ash-400">
            No volverás a recibir correos de Archivos Oscuros. Puedes volver cuando quieras — el archivo
            seguirá aquí.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-[clamp(1.8rem,3vw,2.4rem)]">Enlace no válido</h1>
          <p className="mt-3 leading-relaxed text-ash-400">
            Este enlace de baja no es válido o ha caducado. Si quieres dejar de recibir correos, responde a
            cualquiera de nuestros mensajes y lo haremos manualmente.
          </p>
        </>
      )}
      <Link href="/" className="btn btn-ghost mt-8">
        Volver al inicio
      </Link>
    </section>
  );
}
