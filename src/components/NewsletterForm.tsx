"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type State = "idle" | "loading" | "ok" | "exists" | "error";

export default function NewsletterForm({
  source = "footer",
  eyebrow = "El boletín",
  blurb = "Lanzamientos, libros gratis ocasionales y nada de ruido.",
}: {
  /** Placement id reported to analytics (footer, home-mid, libro…). */
  source?: string;
  eyebrow?: string;
  blurb?: string;
}) {
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  const canSubmit = acceptTerms && marketing && email.trim().length > 3;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    if (!acceptTerms || !marketing) {
      setState("error");
      setMsg("Marca ambas casillas para suscribirte.");
      return;
    }
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true, source }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string; error?: string };
      if (res.ok && body.ok) {
        if (body.status === "exists") {
          setState("exists");
          setMsg("Ya estabas en la lista. Gracias.");
        } else {
          setState("ok");
          setMsg("¡Listo! Te avisaremos de cada lanzamiento.");
          setEmail("");
          trackEvent("newsletter_signup", { source });
        }
      } else if (res.status === 429) {
        setState("error");
        setMsg("Demasiados intentos. Espera un momento.");
      } else {
        setState("error");
        setMsg(body.error ?? "No se pudo completar la suscripción.");
      }
    } catch {
      setState("error");
      setMsg("Error de conexión. Inténtalo de nuevo.");
    }
  }

  const done = state === "ok" || state === "exists";

  return (
    <div className="max-w-md">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <p className="text-[0.95rem] leading-relaxed text-ash-400">{blurb}</p>

      <form onSubmit={onSubmit} className="mt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            aria-label="Tu correo electrónico"
            disabled={state === "loading"}
            className="min-w-0 flex-1 rounded-full border border-bone-100/15 bg-ink-850 px-4 py-2.5 text-[0.92rem] text-bone-100 placeholder:text-ash-500 focus:border-bone-100/40 focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === "loading" || !canSubmit}
            className="btn btn-ember shrink-0 !px-6 !py-2.5 !text-[0.7rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "loading" ? "Enviando…" : "Suscribirme"}
          </button>
        </div>

        {/* Consent — both required to subscribe */}
        <div className="mt-3.5 space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-bone-100"
            />
            <span className="text-[0.8rem] leading-snug text-ash-400">
              Acepto la{" "}
              <Link href="/privacidad" className="text-bone-200 underline underline-offset-2 hover:text-gold-300">
                política de privacidad
              </Link>{" "}
              y los{" "}
              <Link href="/terminos" className="text-bone-200 underline underline-offset-2 hover:text-gold-300">
                términos y condiciones
              </Link>
              .
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-bone-100"
            />
            <span className="text-[0.8rem] leading-snug text-ash-400">
              Quiero recibir novedades, lanzamientos y publicidad de Archivos Oscuros por correo.
            </span>
          </label>
        </div>
      </form>

      {msg && (
        <p role="status" className={`mt-2.5 text-[0.82rem] ${done ? "text-bone-200" : "text-ember-300"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
