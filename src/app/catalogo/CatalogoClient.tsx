"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/types";
import type { Category } from "@/types";
import { searchBooks, sortBooks } from "@/data/books";
import type { SortKey } from "@/data/books";
import { useBooks } from "@/components/BooksProvider";
import BookGrid from "@/components/BookGrid";
import BundlePromo from "@/components/BundlePromo";
import Sigil from "@/components/Sigil";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "valoracion", label: "Mejor valorados" },
  { value: "recientes", label: "Más recientes" },
];

const SORT_VALUES = new Set<SortKey>(SORT_OPTIONS.map((o) => o.value));
const CATEGORY_SLUGS = new Set<string>(CATEGORIES.map((c) => c.slug));

export default function CatalogoClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Search is local state (smooth typing); seeded from ?q= so deep links work.
  const [q, setQ] = useState(params.get("q") ?? "");

  // Resync when the ?q= PARAM changes (soft navigation to /catalogo without it,
  // or a new deep link). Typing never rewrites the URL, so this can't fight the
  // input; keying on the param VALUE means cat/orden changes don't reset it.
  const urlQ = params.get("q") ?? "";
  useEffect(() => setQ(urlQ), [urlQ]);

  const rawCat = params.get("cat");
  const cat: Category | null =
    rawCat && CATEGORY_SLUGS.has(rawCat) ? (rawCat as Category) : null;
  const rawSort = params.get("orden");
  const sortKey: SortKey =
    rawSort && SORT_VALUES.has(rawSort as SortKey) ? (rawSort as SortKey) : "destacados";

  // ── Pipeline ────────────────────────────────────────────────
  const allBooks = useBooks();
  let list = q.trim() ? searchBooks(allBooks, q) : allBooks;
  if (cat) list = list.filter((b) => b.category === cat);
  const result = sortBooks(list, sortKey);

  // ── URL mutators (preserve unrelated params) ────────────────
  function patchParams(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const setCat = (value: Category | null) => patchParams({ cat: value });
  const setSort = (value: SortKey) =>
    patchParams({ orden: value === "destacados" ? null : value });
  const clearFilters = () => {
    setQ("");
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = Boolean(q.trim() || cat);
  const count = result.length;
  const countLabel =
    count === 0 ? "Sin resultados" : `${count} ${count === 1 ? "título" : "títulos"}`;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      {/* ───────────────── Header ───────────────── */}
      <header className="animate-rise">
        <p className="eyebrow mb-5">El archivo completo</p>
        <h1 className="text-[clamp(2.4rem,5vw,4rem)]">Catálogo</h1>
        <p className="meta mt-4">{countLabel}</p>
      </header>

      <div className="mt-8">
        <BundlePromo />
      </div>

      <hr className="gold-rule my-10" />

      {/* ───────────────── Controls ───────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Buscar</span>
            <Sigil motif="eye" className="pointer-events-none absolute left-3.5 top-1/2 w-5 -translate-y-1/2 text-ash-500" weight={2} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, autor o tema…"
              className="w-full rounded-md border border-bone-100/12 bg-ink-800 py-3 pl-11 pr-4 text-bone-100 placeholder:text-ash-500 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
            />
          </label>

          <label className="flex items-center gap-3 lg:shrink-0">
            <span className="meta whitespace-nowrap" style={{ fontFamily: "var(--font-ritual)" }}>Ordenar</span>
            <span className="relative block">
              <select
                value={sortKey}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full appearance-none rounded-md border border-bone-100/12 bg-ink-800 py-2.5 pl-3.5 pr-9 text-[0.95rem] text-bone-100 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 w-4 -translate-y-1/2 text-gold-400">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <FilterPill active={cat === null} onClick={() => setCat(null)}>Todos</FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill key={c.slug} active={cat === c.slug} onClick={() => setCat(cat === c.slug ? null : c.slug)}>
              {c.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <hr className="gold-rule my-10" />

      {/* ───────────────── Results ───────────────── */}
      {count > 0 ? (
        <BookGrid books={result} />
      ) : (
        <div className="mx-auto max-w-md animate-rise">
          <div className="panel flex flex-col items-center px-8 py-14 text-center">
            <span className="mb-6 grid h-16 w-16 place-items-center rounded-full border border-gold-500/25 text-gold-400">
              <Sigil motif="moon" className="w-8" weight={1.8} />
            </span>
            <h2 className="text-[1.5rem] text-bone-50" style={{ fontFamily: "var(--font-display)" }}>
              No hay nada en la oscuridad con esos criterios.
            </h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ash-400">
              Prueba con otra palabra o cambia de senda.
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn btn-ghost mt-8">
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────────────── Category filter pill ───────────────── */
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-md border px-4 py-2 text-[0.72rem] uppercase tracking-[0.16em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        active
          ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
          : "border-bone-100/12 bg-ink-800 text-ash-400 hover:border-gold-500/35 hover:text-bone-100",
      ].join(" ")}
      style={{ fontFamily: "var(--font-ritual)" }}
    >
      {children}
    </button>
  );
}
