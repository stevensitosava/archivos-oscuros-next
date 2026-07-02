import type { Metadata } from "next";
import LegalPage, { V } from "@/components/LegalPage";
import { LEGAL } from "@/data/legal";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Información legal del titular de Archivos Oscuros conforme a la LSSI-CE.",
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegal() {
  return (
    <LegalPage eyebrow="Información legal" title="Aviso legal" current="Aviso legal">
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), se ponen a disposición de los usuarios los
        siguientes datos del titular de este sitio web.
      </p>

      <h2>1. Titular del sitio</h2>
      <ul>
        <li>Titular: <V>{LEGAL.operator}</V></li>
        {LEGAL.taxId ? <li>NIF/CIF: <V>{LEGAL.taxId}</V></li> : null}
        <li>Domicilio: <V>{LEGAL.address}</V> ({LEGAL.country})</li>
        <li>Correo electrónico: <V>{LEGAL.email}</V></li>
        {LEGAL.registry ? <li>Datos registrales: <V>{LEGAL.registry}</V></li> : null}
        <li>Sitio web: {LEGAL.domain}</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        <strong>{LEGAL.brand}</strong> es una librería digital que comercializa libros electrónicos
        (ebooks) descargables sobre estoicismo, historia y filosofía. El presente aviso regula el
        acceso y uso del sitio web, sin perjuicio de que determinados servicios (compra, cuenta de
        usuario) puedan estar sujetos a condiciones particulares.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El usuario se compromete a hacer un uso adecuado y lícito del sitio y de sus contenidos, y a
        no emplearlos para actividades ilícitas, lesivas de derechos de terceros, o que puedan dañar,
        sobrecargar o impedir el normal funcionamiento del sitio. El acceso es gratuito, salvo el
        coste de la conexión a través de la red de telecomunicaciones del usuario.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del sitio (textos, imágenes, diseño, código, marcas y los propios
        ebooks) son titularidad de <V>{LEGAL.operator}</V> o de sus licenciantes, y están protegidos
        por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción,
        distribución, comunicación pública o transformación sin autorización expresa. La compra de un
        ebook concede una licencia de uso personal e intransferible (ver{" "}
        <a href="/terminos">Términos y condiciones</a>), no la cesión de derechos de propiedad
        intelectual.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        El titular no se responsabiliza de los daños derivados de un uso indebido del sitio, ni
        garantiza la ausencia de interrupciones o errores en el acceso, si bien empleará medios
        razonables para evitarlos. Los enlaces a sitios de terceros se ofrecen únicamente a título
        informativo y no implican responsabilidad sobre sus contenidos.
      </p>

      <h2>6. Legislación aplicable y jurisdicción</h2>
      <p>
        El presente aviso se rige por la legislación española. Para la resolución de cualquier
        controversia, las partes se someten a los juzgados y tribunales del domicilio del usuario
        cuando este tenga la condición de consumidor.
      </p>
    </LegalPage>
  );
}
