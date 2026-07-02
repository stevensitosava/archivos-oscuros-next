import Link from "next/link";
import Wordmark from "./Wordmark";
import NewsletterForm from "./NewsletterForm";
import CookiePrefsButton from "./CookiePrefsButton";
import { CATEGORIES } from "../types";

const LEGAL_LINKS = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "/cookies", label: "Cookies" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-bone-100/10 bg-ink-900/60">
      {/* Newsletter band */}
      <div className="border-b border-bone-100/10">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <NewsletterForm />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark stacked />
          <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-ash-400">
            Librería digital de estoicismo, historia y filosofía de guerreros.
            Cada volumen es un archivo descargable al instante — para forjar el carácter.
          </p>
        </div>

        <nav aria-label="Categorías">
          <p className="eyebrow mb-4">Categorías</p>
          <ul className="space-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogo?cat=${c.slug}`}
                  className="text-[0.95rem] text-bone-200/75 transition-colors hover:text-gold-300"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Tienda">
          <p className="eyebrow mb-4">La tienda</p>
          <ul className="space-y-2.5">
            <li><Link href="/catalogo" className="text-[0.95rem] text-bone-200/75 hover:text-gold-300">Catálogo completo</Link></li>
            <li><Link href="/gratis" className="text-[0.95rem] text-bone-200/75 hover:text-gold-300">Libros gratis</Link></li>
            <li><Link href="/biblioteca" className="text-[0.95rem] text-bone-200/75 hover:text-gold-300">Mi Biblioteca</Link></li>
            <li><Link href="/carrito" className="text-[0.95rem] text-bone-200/75 hover:text-gold-300">Carrito</Link></li>
            <li><Link href="/acceso" className="text-[0.95rem] text-bone-200/75 hover:text-gold-300">Acceso</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <p className="eyebrow mb-4">Legal</p>
          <ul className="space-y-2.5">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[0.95rem] text-bone-200/75 transition-colors hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <CookiePrefsButton className="text-[0.95rem] text-bone-200/75 transition-colors hover:text-gold-300">
                Configurar cookies
              </CookiePrefsButton>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-bone-100/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:flex-row sm:text-left sm:px-8">
          <p className="meta">© {new Date().getFullYear()} ARCHIVOS OSCUROS</p>
          <p className="meta text-ash-400">Hecho y diseñado por Steven y Alberto</p>
          <p className="meta text-ash-500">Pagos seguros con Stripe · Entrega inmediata</p>
        </div>
      </div>
    </footer>
  );
}
