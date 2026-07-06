import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL } from "@/data/legal";
import { SITE_URL } from "@/lib/env";
import { safeJsonLd } from "@/lib/jsonld";

const LEGAL_LINKS = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "/cookies", label: "Cookies" },
];

/** Shared shell for the four legal pages — eyebrow, title, draft notice,
 *  prose body, cross-links, and the last-updated stamp. */
export default function LegalPage({
  eyebrow,
  title,
  children,
  current,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  current: string;
}) {
  const currentHref = LEGAL_LINKS.find((l) => l.label === current)?.href ?? "/";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${currentHref}` },
    ],
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }} />
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{title}</h1>

      {!LEGAL.filled && (
        <div className="panel mt-7 flex gap-3 p-4 text-[0.9rem] text-ash-400">
          <span aria-hidden="true">⚠️</span>
          <p className="!mb-0">
            <strong className="text-bone-100">Borrador.</strong> Este documento contiene{" "}
            <span className="font-mono text-ember-300">[datos entre corchetes]</span> pendientes de
            completar con los datos reales del titular. Edita{" "}
            <span className="font-mono text-bone-200">src/data/legal.ts</span> y pon{" "}
            <span className="font-mono text-bone-200">filled: true</span> antes de publicar.
          </p>
        </div>
      )}

      <div className="legal mt-10">{children}</div>

      <hr className="gold-rule my-12" />
      <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Documentos legales">
        {LEGAL_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[0.85rem] transition-colors ${
              l.label === current ? "text-bone-50" : "text-ash-500 hover:text-bone-200"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="meta mt-6">Última actualización: {LEGAL.updated}</p>
    </section>
  );
}

/** Inline placeholder/real-value renderer — bracketed values render highlighted. */
export function V({ children }: { children: string }) {
  const isPh = /\[.*\]/.test(children);
  return isPh ? <span className="ph">{children}</span> : <strong>{children}</strong>;
}
