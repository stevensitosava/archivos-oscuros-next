"use client";

import { useState } from "react";
import { sendBroadcastAction } from "./actions";

const inputCls =
  "w-full rounded-md border border-bone-100/12 bg-ink-800 px-3.5 py-2.5 text-[0.95rem] text-bone-100 placeholder:text-ash-500 transition-colors focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30";
const labelCls = "mb-1.5 block text-[0.72rem] uppercase tracking-[0.16em] text-ash-500";

export default function BroadcastComposer({
  recipientCount,
  emailConfigured,
}: {
  recipientCount: number;
  emailConfigured: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const canSend = emailConfigured && recipientCount > 0 && subject.trim().length >= 3 && body.trim().length >= 10;

  const send = async () => {
    if (!canSend) return;
    if (!window.confirm(`¿Enviar esta campaña a ${recipientCount} suscriptor(es)? No se puede deshacer.`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await sendBroadcastAction({ subject, body, ctaLabel, ctaUrl });
      if (!res.ok) {
        setMsg({ kind: "err", text: res.error ?? "No se pudo enviar." });
      } else {
        const r = res.result!;
        setMsg({ kind: "ok", text: `Enviado a ${r.sent} de ${r.total}${r.failed ? ` · ${r.failed} fallidos` : ""}.` });
        setSubject("");
        setBody("");
        setCtaLabel("");
        setCtaUrl("");
      }
    } catch {
      setMsg({ kind: "err", text: "Error inesperado al enviar." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel mb-10 p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[1.3rem] text-bone-50" style={{ fontFamily: "var(--font-display)" }}>
          Nueva campaña
        </h2>
        <span className="text-[0.8rem] text-ash-400">
          {recipientCount} destinatario(s) con consentimiento
        </span>
      </div>

      {!emailConfigured && (
        <p className="mb-5 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[0.85rem] text-amber-200">
          El envío está desactivado: falta <code>RESEND_API_KEY</code> en el entorno.
        </p>
      )}

      <div className="grid gap-4">
        <div>
          <label className={labelCls} htmlFor="bc-subject">Asunto</label>
          <input
            id="bc-subject"
            className={inputCls}
            value={subject}
            maxLength={200}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="p. ej. Nuevo libro: Sangre Espartana"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="bc-body">Mensaje</label>
          <textarea
            id="bc-body"
            className={`${inputCls} min-h-[160px] resize-y leading-relaxed`}
            value={body}
            maxLength={20000}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"Escribe tu mensaje.\n\nDeja una línea en blanco para separar párrafos."}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="bc-cta-label">Botón — etiqueta (opcional)</label>
            <input
              id="bc-cta-label"
              className={inputCls}
              value={ctaLabel}
              maxLength={60}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ver el libro"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="bc-cta-url">Botón — enlace (opcional)</label>
            <input
              id="bc-cta-url"
              className={inputCls}
              value={ctaUrl}
              maxLength={400}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://www.archivososcuros.com/catalogo"
            />
          </div>
        </div>
      </div>

      {msg && (
        <p className={`mt-4 text-[0.9rem] ${msg.kind === "ok" ? "text-emerald-300" : "text-ember-400"}`}>{msg.text}</p>
      )}

      <button
        type="button"
        onClick={send}
        disabled={busy || !canSend}
        className="btn btn-ember mt-6 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Enviando…" : `Enviar campaña${recipientCount ? ` (${recipientCount})` : ""}`}
      </button>
    </div>
  );
}
