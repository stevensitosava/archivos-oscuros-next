import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import CookiePrefsButton from "@/components/CookiePrefsButton";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies usa Archivos Oscuros y cómo gestionarlas.",
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  return (
    <LegalPage eyebrow="Cookies" title="Política de cookies" current="Cookies">
      <p>
        Una cookie es un pequeño archivo que un sitio web guarda en tu dispositivo. En{" "}
        <strong>Archivos Oscuros</strong> usamos el mínimo imprescindible y te pedimos permiso para
        cualquier cookie que no sea estrictamente necesaria.
      </p>

      <h2>1. Tipos de cookies que usamos</h2>
      <h3>Estrictamente necesarias (siempre activas)</h3>
      <ul>
        <li>
          <strong>Autenticación y sesión</strong> (proveedor: Clerk) — mantienen tu sesión iniciada
          y protegen tu cuenta.
        </li>
        <li>
          <strong>Seguridad</strong> — prevención de abuso y protección frente a peticiones
          fraudulentas.
        </li>
        <li>
          <strong>Preferencias</strong> — guardamos tu elección sobre cookies y el contenido de tu
          carrito en el almacenamiento local de tu navegador.
        </li>
      </ul>
      <p>
        Estas son imprescindibles para que el sitio funcione y no requieren consentimiento conforme a
        la normativa.
      </p>

      <h3>Analíticas y de marketing (opcionales)</h3>
      <p>
        Actualmente <strong>no cargamos cookies de analítica ni de marketing de terceros</strong>. Si
        en el futuro las incorporamos, solo se activarán si das tu consentimiento a través del panel
        de configuración, y esta política se actualizará en consecuencia.
      </p>

      <h2>2. Gestionar tus preferencias</h2>
      <p>
        Puedes revisar o cambiar tu elección en cualquier momento desde aquí:
      </p>
      <p>
        <CookiePrefsButton className="btn btn-ghost !text-[0.7rem]" />
      </p>
      <p>
        También puedes bloquear o eliminar cookies desde la configuración de tu navegador (Chrome,
        Firefox, Safari, Edge…). Ten en cuenta que desactivar las cookies necesarias puede impedir el
        correcto funcionamiento del inicio de sesión y la compra.
      </p>

      <h2>3. Más información</h2>
      <p>
        Para saber cómo tratamos tus datos personales, consulta nuestra{" "}
        <a href="/privacidad">Política de privacidad</a>.
      </p>
    </LegalPage>
  );
}
