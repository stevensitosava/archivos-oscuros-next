import type { Metadata } from "next";
import LegalPage, { V } from "@/components/LegalPage";
import { LEGAL } from "@/data/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de venta de los ebooks de Archivos Oscuros.",
  alternates: { canonical: "/terminos" },
};

export default function Terminos() {
  return (
    <LegalPage eyebrow="Condiciones de venta" title="Términos y condiciones" current="Términos">
      <p>
        Estas condiciones regulan la compra de libros electrónicos (ebooks) en{" "}
        <strong>{LEGAL.brand}</strong>, titularidad de <V>{LEGAL.operator}</V>. Al realizar una
        compra, aceptas estas condiciones.
      </p>

      <h2>1. Objeto y productos</h2>
      <p>
        Vendemos archivos digitales descargables (ebooks). La descripción, formato y precio de cada
        título figuran en su ficha. Los precios se muestran en euros (EUR) e incluyen, en su caso,
        los impuestos aplicables.
      </p>

      <h2>2. Proceso de compra y pago</h2>
      <p>
        Para comprar debes disponer de una cuenta. El pago se realiza de forma segura a través de{" "}
        <strong>Stripe</strong>; no tenemos acceso a los datos de tu tarjeta. La compra se considera
        perfeccionada cuando Stripe confirma el pago, momento en que se habilita el acceso al archivo
        en tu biblioteca.
      </p>

      <h2>3. Entrega</h2>
      <p>
        La entrega es <strong>inmediata y digital</strong>: tras la confirmación del pago, el ebook
        queda disponible para su descarga desde tu biblioteca, mediante enlaces seguros de duración
        limitada. No se envía ningún producto físico.
      </p>

      <h2>4. Derecho de desistimiento</h2>
      <p>
        De acuerdo con el artículo 103.m) del Real Decreto Legislativo 1/2007 (Ley General para la
        Defensa de los Consumidores y Usuarios), <strong>el derecho de desistimiento no resulta
        aplicable</strong> al suministro de contenido digital no prestado en soporte material cuando
        la ejecución haya comenzado con el consentimiento previo y expreso del consumidor y su
        conocimiento de que pierde dicho derecho. Al iniciar la descarga de un ebook, reconoces y
        aceptas esta circunstancia.
      </p>

      <h2>5. Licencia de uso</h2>
      <p>
        La compra concede una licencia <strong>personal, intransferible y no exclusiva</strong> para
        leer el ebook. Queda prohibido revender, redistribuir, compartir públicamente, copiar de
        forma masiva o eliminar las medidas de protección de los archivos. La propiedad intelectual
        permanece en su titular.
      </p>

      <h2>6. Disponibilidad y precios</h2>
      <p>
        Nos reservamos el derecho a modificar el catálogo y los precios en cualquier momento. El
        precio aplicable a tu pedido es el vigente en el momento de la compra. Procuraremos corregir
        con prontitud cualquier error evidente de precio o descripción.
      </p>

      <h2>7. Reembolsos</h2>
      <p>
        Dada la naturaleza digital e inmediata de los productos, y sin perjuicio de tus derechos
        legales como consumidor, las compras no son reembolsables una vez iniciada la descarga, salvo
        defecto del archivo o error imputable a la tienda. Para cualquier incidencia, escríbenos a{" "}
        <V>{LEGAL.email}</V> y buscaremos una solución.
      </p>

      <h2>8. Responsabilidad</h2>
      <p>
        El contenido de los ebooks tiene carácter divulgativo y no constituye asesoramiento
        profesional. En la máxima medida permitida por la ley, el titular no será responsable de los
        usos que el lector haga de dicho contenido.
      </p>

      <h2>9. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Como consumidor, también puedes
        acudir a la plataforma de resolución de litigios en línea de la Comisión Europea:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </LegalPage>
  );
}
