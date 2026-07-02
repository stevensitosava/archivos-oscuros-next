import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";
import Sigil from "@/components/Sigil";
import AuthScene from "@/components/AuthScene";
import { clerkDarkAppearance } from "@/lib/clerkAppearance";

export const metadata: Metadata = { title: "Acceso", robots: { index: false } };

export default function AccesoPage() {
  if (!isClerkConfigured) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <Sigil motif="key" className="w-12 text-gold-400" weight={1.5} />
        <p className="eyebrow mt-6">Acceso</p>
        <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)]">Entra en el archivo</h1>
        <p className="mt-5 text-ash-400">
          El acceso con Clerk se activa al añadir las claves de Clerk en{" "}
          <code>.env.local</code>.
        </p>
      </section>
    );
  }

  return (
    <AuthScene animation="Axe_Stance">
      <SignIn appearance={clerkDarkAppearance} />
    </AuthScene>
  );
}
