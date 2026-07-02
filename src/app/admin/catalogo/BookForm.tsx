"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveBook, removeBook } from "./actions";

export interface FormState {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  priceCents: number;
  currency: string;
  tagline: string;
  synopsis: string;
  pages: number;
  year: number;
  language: string;
  tags: string[];
  formats: string[];
  coverMotif: string;
  coverImage: string;
  stripePriceId: string;
  storagePath: string;
  featured: boolean;
  rating: number;
  sortOrder: number;
  published: boolean;
}

const MOTIFS = ["eye", "moon", "serpent", "skull", "pentacle", "key", "candle", "hand"];
const CATS = ["estoicismo", "guerreros", "historia", "filosofia"];
const FORMATS = ["EPUB", "PDF", "MOBI"];

const INPUT =
  "w-full rounded-md border border-bone-100/12 bg-ink-850 px-3 py-2 text-[0.92rem] text-bone-100 placeholder:text-ash-600 focus:border-bone-100/40 focus:outline-none";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function BookForm({
  mode,
  originalId,
  initial,
}: {
  mode: "create" | "update";
  originalId: string;
  initial: FormState;
}) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(initial);
  const [priceEuros, setPriceEuros] = useState((initial.priceCents / 100).toFixed(2));
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"cover" | "ebook" | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  async function upload(kind: "cover" | "ebook", file: File) {
    setUploading(kind);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = (await res.json()) as { value?: string; error?: string };
      if (!res.ok || !body.value) throw new Error(body.error ?? "Error al subir.");
      if (kind === "cover") set("coverImage", body.value);
      else set("storagePath", body.value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir el archivo.");
    } finally {
      setUploading(null);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setNote(null);
    const cents = Math.max(0, Math.round((parseFloat(priceEuros.replace(",", ".")) || 0) * 100));
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      ...f,
      priceCents: cents,
      tags,
      pages: Number(f.pages) || 0,
      year: Number(f.year) || 0,
      rating: Number(f.rating) || 0,
      sortOrder: Number(f.sortOrder) || 0,
      coverImage: f.coverImage || null,
      stripePriceId: f.stripePriceId || null,
      storagePath: f.storagePath || null,
    };
    const res = await saveBook(mode, originalId, payload);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar.");
      return;
    }
    if (res.error) setNote(res.error);
    router.push("/admin/catalogo");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("¿Eliminar este libro? Esta acción no se puede deshacer.")) return;
    setBusy(true);
    setError(null);
    const res = await removeBook(originalId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo eliminar.");
      return;
    }
    router.push("/admin/catalogo");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      {error && <div className="panel mb-5 border-ember-500/30 p-3 text-[0.9rem] text-ember-300">{error}</div>}
      {note && <div className="panel mb-5 border-amber-500/30 p-3 text-[0.9rem] text-amber-300">{note}</div>}

      <div className="space-y-8">
        {/* Identidad */}
        <Section title="Identidad">
          <Grid>
            <Field label="ID" hint="minúsculas-con-guiones · no se puede cambiar tras crear">
              <input
                className={INPUT}
                value={f.id}
                disabled={mode === "update"}
                onChange={(e) => set("id", e.target.value)}
                placeholder="ao-007"
              />
            </Field>
            <Field label="Slug (URL)">
              <input className={INPUT} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="titulo-del-libro" />
            </Field>
          </Grid>
          <Field label="Título">
            <input
              className={INPUT}
              value={f.title}
              onChange={(e) => {
                const v = e.target.value;
                set("title", v);
                if (mode === "create" && (!f.slug || f.slug === slugify(f.title))) set("slug", slugify(v));
              }}
            />
          </Field>
          <Grid>
            <Field label="Autor">
              <input className={INPUT} value={f.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="Categoría">
              <select className={INPUT} value={f.category} onChange={(e) => set("category", e.target.value)}>
                {CATS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </Section>

        {/* Precio & estado */}
        <Section title="Precio y estado">
          <Grid>
            <Field label="Precio (€)" hint="0 = gratis">
              <input className={INPUT} value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} inputMode="decimal" />
            </Field>
            <Field label="Orden" hint="menor = primero">
              <input className={INPUT} type="number" value={f.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
            </Field>
          </Grid>
          <Grid>
            <Field label="Valoración (0–5)">
              <input className={INPUT} type="number" step="0.1" min="0" max="5" value={f.rating} onChange={(e) => set("rating", Number(e.target.value))} />
            </Field>
            <Field label="Stripe Price ID" hint="opcional">
              <input className={INPUT} value={f.stripePriceId} onChange={(e) => set("stripePriceId", e.target.value)} placeholder="price_..." />
            </Field>
          </Grid>
          <div className="flex flex-wrap gap-6 pt-1">
            <Toggle label="Publicado" checked={f.published} onChange={(v) => set("published", v)} />
            <Toggle label="Destacado" checked={f.featured} onChange={(v) => set("featured", v)} />
          </div>
        </Section>

        {/* Contenido */}
        <Section title="Contenido">
          <Field label="Gancho (tagline)">
            <input className={INPUT} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Sinopsis" hint="párrafos separados por una línea en blanco">
            <textarea className={`${INPUT} min-h-[140px] resize-y`} value={f.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
          </Field>
          <Grid>
            <Field label="Páginas">
              <input className={INPUT} type="number" value={f.pages} onChange={(e) => set("pages", Number(e.target.value))} />
            </Field>
            <Field label="Año">
              <input className={INPUT} type="number" value={f.year} onChange={(e) => set("year", Number(e.target.value))} />
            </Field>
          </Grid>
          <Grid>
            <Field label="Idioma">
              <input className={INPUT} value={f.language} onChange={(e) => set("language", e.target.value)} />
            </Field>
            <Field label="Etiquetas" hint="separadas por comas">
              <input className={INPUT} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="disciplina, honor" />
            </Field>
          </Grid>
          <Field label="Formatos">
            <div className="flex gap-4">
              {FORMATS.map((fmt) => (
                <Toggle
                  key={fmt}
                  label={fmt}
                  checked={f.formats.includes(fmt)}
                  onChange={(v) => set("formats", v ? [...f.formats, fmt] : f.formats.filter((x) => x !== fmt))}
                />
              ))}
            </div>
          </Field>
        </Section>

        {/* Portada */}
        <Section title="Portada">
          <Grid>
            <Field label="Motivo (cover procedural)">
              <select className={INPUT} value={f.coverMotif} onChange={(e) => set("coverMotif", e.target.value)}>
                {MOTIFS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Imagen de portada (URL)" hint="si se define, sustituye al motivo">
              <input className={INPUT} value={f.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="/portada.webp o https://…" />
            </Field>
          </Grid>
          <div className="flex items-center gap-4">
            <UploadButton
              label={uploading === "cover" ? "Subiendo…" : "Subir imagen"}
              accept="image/*"
              disabled={uploading !== null}
              onFile={(file) => upload("cover", file)}
            />
            {f.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.coverImage} alt="" className="h-16 w-11 rounded-sm object-cover" />
            )}
          </div>
        </Section>

        {/* Archivo */}
        <Section title="Archivo del ebook">
          <Field label="Ruta en el bucket privado (storage_path)" hint="usado por la descarga segura">
            <input className={INPUT} value={f.storagePath} onChange={(e) => set("storagePath", e.target.value)} placeholder="ebook-….pdf" />
          </Field>
          <UploadButton
            label={uploading === "ebook" ? "Subiendo…" : "Subir ebook (PDF/EPUB)"}
            accept=".pdf,.epub,.mobi,application/pdf,application/epub+zip"
            disabled={uploading !== null}
            onFile={(file) => upload("ebook", file)}
          />
        </Section>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-bone-100/10 pt-6">
        <button type="button" onClick={submit} disabled={busy} className="btn btn-ember !px-6 !py-2.5 !text-[0.7rem]">
          {busy ? "Guardando…" : mode === "create" ? "Crear libro" : "Guardar cambios"}
        </button>
        <Link href="/admin/catalogo" className="btn btn-ghost !px-6 !py-2.5 !text-[0.7rem]">
          Cancelar
        </Link>
        {mode === "update" && (
          <button type="button" onClick={onDelete} disabled={busy} className="ml-auto text-[0.8rem] text-ember-400 transition-colors hover:text-ember-300">
            Eliminar libro
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="mb-4 text-[0.78rem] uppercase tracking-[0.2em] text-ash-500">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.82rem] text-bone-200">{label}</span>
        {hint && <span className="text-[0.72rem] text-ash-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-bone-100" />
      <span className="text-[0.85rem] text-bone-200">{label}</span>
    </label>
  );
}
function UploadButton({
  label,
  accept,
  disabled,
  onFile,
}: {
  label: string;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label className={`btn btn-ghost !px-5 !py-2.5 !text-[0.7rem] ${disabled ? "pointer-events-none opacity-50" : ""}`}>
      {label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
