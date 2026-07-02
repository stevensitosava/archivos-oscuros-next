"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Panel", exact: true },
  { href: "/admin/catalogo", label: "Catálogo" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/boletin", label: "Boletín" },
];

export default function AdminNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact ? path === l.href : path === l.href || path.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-2 text-[0.9rem] transition-colors ${
              active ? "bg-bone-50 text-ink-950" : "text-ash-400 hover:bg-ink-800 hover:text-bone-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
