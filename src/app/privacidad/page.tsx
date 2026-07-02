import type { Metadata } from "next";
import LegalPage, { V } from "@/components/LegalPage";
import { LEGAL } from "@/data/legal";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo Archivos Oscuros trata tus datos personales conforme al RGPD y la LOPDGDD.",
  alternates: { canonical: "/privacidad" },
};

export default function Privacidad() {
  return (
    <LegalPage eyebrow="Protección de datos" title="Política de privacidad" current="Privacidad">
      <p>
        Esta política explica cómo <strong>{LEGAL.brand}</strong> trata tus datos personales, en
        cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Responsable: <V>{LEGAL.operator}</V></li>
        {LEGAL.taxId ? <li>NIF/CIF: <V>{LEGAL.taxId}</V></li> : null}
        <li>Domicilio: <V>{LEGAL.address}</V> ({LEGAL.country})</li>
        <li>Contacto: <V>{LEGAL.email}</V></li>
      </ul>

      <h2>2. Qué datos tratamos y con qué finalidad</h2>
      <ul>
        <li>
          <strong>Cuenta de usuario:</strong> correo electrónico y datos de autenticación, para
          crear y gestionar tu cuenta y darte acceso a tu biblioteca de compras. La autenticación la
          gestiona nuestro proveedor Clerk.
        </li>
        <li>
          <strong>Compras:</strong> datos de la transacción (productos, importe, identificador de
          pago) para procesar el pedido y darte acceso a los ebooks. El pago se procesa a través de
          Stripe; <strong>no almacenamos los datos de tu tarjeta</strong>.
        </li>
        <li>
          <strong>Boletín (newsletter):</strong> correo electrónico, si te suscribes voluntariamente,
          para enviarte novedades y lanzamientos. Puedes darte de baja en cualquier momento.
        </li>
        <li>
          <strong>Datos técnicos:</strong> datos estrictamente necesarios para la seguridad y el
          funcionamiento del sitio (p. ej. dirección IP para prevención de abuso/limitación de
          peticiones).
        </li>
      </ul>

      <h2>3. Base jurídica</h2>
      <ul>
        <li><strong>Ejecución de un contrato</strong> (art. 6.1.b RGPD): cuenta y compras.</li>
        <li><strong>Consentimiento</strong> (art. 6.1.a RGPD): suscripción al boletín. Revocable.</li>
        <li>
          <strong>Interés legítimo</strong> (art. 6.1.f RGPD): seguridad del sitio y prevención de
          fraude/abuso.
        </li>
      </ul>

      <h2>4. Destinatarios y encargados del tratamiento</h2>
      <p>
        No vendemos tus datos. Compartimos los mínimos necesarios con proveedores que actúan como
        encargados del tratamiento, bajo contrato y con garantías adecuadas:
      </p>
      <ul>
        <li><strong>Clerk</strong> — autenticación y gestión de cuentas.</li>
        <li><strong>Stripe</strong> — procesamiento de pagos.</li>
        <li><strong>Supabase</strong> — base de datos y almacenamiento de los archivos.</li>
        <li><strong>Vercel</strong> — alojamiento e infraestructura del sitio.</li>
      </ul>

      <h2>5. Transferencias internacionales</h2>
      <p>
        Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En tales casos,
        las transferencias se amparan en mecanismos válidos del RGPD (decisiones de adecuación o
        Cláusulas Contractuales Tipo de la Comisión Europea).
      </p>

      <h2>6. Conservación</h2>
      <p>
        Conservamos los datos mientras tu cuenta esté activa y, tras su cancelación, durante los
        plazos legales aplicables (p. ej. obligaciones fiscales y contables). Los datos del boletín
        se conservan hasta que retires tu consentimiento.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de <strong>acceso, rectificación, supresión, oposición,
        limitación del tratamiento y portabilidad</strong>, así como retirar el consentimiento en
        cualquier momento, escribiendo a <V>{LEGAL.email}</V>. Si consideras que el tratamiento no se
        ajusta a la normativa, puedes reclamar ante la Agencia Española de Protección de Datos
        (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: cifrado en
        tránsito (HTTPS), control de acceso, almacenamiento de los archivos en un bucket privado con
        enlaces firmados de corta duración, y limitación de peticiones frente a abusos.
      </p>
    </LegalPage>
  );
}
