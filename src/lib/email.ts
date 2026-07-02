import "server-only";
import { SITE_URL } from "./env";

/* ============================================================
   Email delivery via Resend (REST, no SDK dependency).
   Graceful degradation: with no RESEND_API_KEY the app runs
   exactly as before and every send is a logged no-op — same
   demo-mode contract as Clerk/Supabase/Stripe.
   Secrets are read here (server-only); never import from a client.
   ============================================================ */

const API_KEY = process.env.RESEND_API_KEY?.trim() ?? "";
/** Verified sender. Must be an address on a domain verified in Resend. */
export const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || "Archivos Oscuros <hola@archivososcuros.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO?.trim() || "";

export const isEmailConfigured = Boolean(API_KEY);

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_BATCH_ENDPOINT = "https://api.resend.com/emails/batch";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Extra headers (e.g. List-Unsubscribe). */
  headers?: Record<string, string>;
}

/** Send one email. Best-effort: returns false (never throws) so a delivery
 *  failure can never break a checkout, a signup, or a download. */
export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  if (!isEmailConfigured) {
    console.info("[email] skipped (no RESEND_API_KEY):", msg.subject, "→", msg.to);
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
        ...(msg.headers ? { headers: msg.headers } : {}),
      }),
    });
    if (!res.ok) {
      console.warn("[email] send failed", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[email] send error:", e instanceof Error ? e.message : e);
    return false;
  }
}

/** Send a batch (personalised per-recipient). Chunks to Resend's 100/req cap.
 *  Returns how many were accepted. Best-effort per chunk. */
export async function sendEmailBatch(messages: EmailMessage[]): Promise<{ sent: number; failed: number }> {
  if (!isEmailConfigured) {
    console.info("[email] batch skipped (no RESEND_API_KEY):", messages.length, "messages");
    return { sent: 0, failed: messages.length };
  }
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch(RESEND_BATCH_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          chunk.map((m) => ({
            from: EMAIL_FROM,
            to: Array.isArray(m.to) ? m.to : [m.to],
            subject: m.subject,
            html: m.html,
            text: m.text,
            ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
            ...(m.headers ? { headers: m.headers } : {}),
          })),
        ),
      });
      if (res.ok) sent += chunk.length;
      else {
        failed += chunk.length;
        console.warn("[email] batch chunk failed", res.status, (await res.text()).slice(0, 300));
      }
    } catch (e) {
      failed += chunk.length;
      console.warn("[email] batch error:", e instanceof Error ? e.message : e);
    }
  }
  return { sent, failed };
}

/* ─────────────────────────────────────────────────────────────
   Branded template. Email-safe: table layout, inline styles, a
   web-safe font stack (Poppins won't load in most clients — the
   fallback keeps it clean). Dark, bone text, ember accent.
   ───────────────────────────────────────────────────────────── */

const C = {
  bg: "#0a0a0b",
  panel: "#141416",
  border: "#26262a",
  bone: "#ececed",
  ash: "#9a9aa0",
  ember: "#b2342a",
  emberDark: "#8a261d",
};
const FONT = "'Poppins','Helvetica Neue',Arial,sans-serif";

export interface EmailTemplate {
  /** Hidden inbox preview line. */
  preheader?: string;
  heading: string;
  /** Paragraphs of body copy (plain strings, rendered as <p>). */
  paragraphs?: string[];
  /** Raw HTML block inserted after the paragraphs (e.g. an order list). */
  bodyHtml?: string;
  cta?: { label: string; url: string };
  /** Absolute unsubscribe URL — renders the footer opt-out line when present. */
  unsubscribeUrl?: string;
}

/** HTML-escape untrusted text before it goes into the email markup. NOT applied
 *  to bodyHtml (intentionally raw, server-built) or to paragraphs (already
 *  escaped by their callers, e.g. broadcast.ts). */
function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

/** Render the full branded HTML document for an email. */
export function renderEmail(t: EmailTemplate): string {
  const paras = (t.paragraphs ?? [])
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.bone};">${p}</p>`,
    )
    .join("");

  const cta = t.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;"><tr><td style="border-radius:8px;background:${C.ember};">
         <a href="${encodeURI(t.cta.url)}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:600;letter-spacing:.02em;color:#fff;text-decoration:none;border-radius:8px;">${esc(t.cta.label)}</a>
       </td></tr></table>`
    : "";

  const unsub = t.unsubscribeUrl
    ? `<p style="margin:14px 0 0;font-family:${FONT};font-size:11px;line-height:1.6;color:${C.ash};">
         Recibes este correo porque te suscribiste en Archivos Oscuros.
         <a href="${t.unsubscribeUrl}" style="color:${C.ash};text-decoration:underline;">Darse de baja</a>.
       </p>`
    : "";

  const preheader = t.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(t.preheader)}</div>`
    : "";

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:${C.bg};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${C.panel};border:1px solid ${C.border};border-radius:14px;overflow:hidden;">
      <tr><td style="padding:30px 34px 8px;">
        <a href="${SITE_URL}" style="font-family:${FONT};font-size:13px;font-weight:600;letter-spacing:.28em;color:${C.bone};text-decoration:none;">ARCHIVOS&nbsp;OSCUROS</a>
        <div style="height:1px;background:${C.border};margin:18px 0 4px;"></div>
      </td></tr>
      <tr><td style="padding:14px 34px 30px;">
        <h1 style="margin:0 0 18px;font-family:${FONT};font-size:23px;font-weight:600;line-height:1.25;color:#fff;">${esc(t.heading)}</h1>
        ${paras}
        ${t.bodyHtml ?? ""}
        ${cta}
      </td></tr>
      <tr><td style="padding:20px 34px 28px;border-top:1px solid ${C.border};">
        <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.6;color:${C.ash};">
          Archivos Oscuros · Sabiduría de guerreros, estoicos e historia. Entrega 100% digital (PDF).
        </p>
        ${unsub}
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:${C.ash};">© Archivos Oscuros · <a href="${SITE_URL}" style="color:${C.ash};text-decoration:underline;">archivososcuros.com</a></p>
  </td></tr>
</table>
</body></html>`;
}
