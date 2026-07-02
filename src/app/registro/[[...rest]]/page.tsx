import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";
import Sigil from "@/components/Sigil";
import AuthScene from "@/components/AuthScene";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default function RegistroPage() {
  if (!isClerkConfigured) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <Sigil motif="moon" className="w-12 text-gold-400" weight={1.5} />
        <p className="eyebrow mt-6">Crear cuenta</p>
        <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)]">Únete al archivo</h1>
        <p className="mt-5 text-ash-400">
          El registro con Clerk se activa al añadir las claves de Clerk en{" "}
          <code>.env.local</code>.
        </p>
      </section>
    );
  }

  return (
    <AuthScene animation="Axe_Stance">
      <SignUp appearance={clerkDarkAppearance} />
    </AuthScene>
  );
}
