"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth-server";
import { isEmailConfigured } from "@/lib/email";
import { sendBroadcast, type BroadcastResult } from "@/lib/broadcast";

const Schema = z.object({
  subject: z.string().trim().min(3, "El asunto es obligatorio.").max(200),
  body: z.string().trim().min(10, "El mensaje es demasiado corto.").max(20000),
  ctaLabel: z.string().trim().max(60).default(""),
  ctaUrl: z.string().trim().max(400).default(""),
});

export async function sendBroadcastAction(
  input: unknown,
): Promise<{ ok: boolean; error?: string; result?: BroadcastResult }> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "No autorizado." };
  }
  if (!isEmailConfigured) {
    return { ok: false, error: "Email no configurado (falta RESEND_API_KEY)." };
  }
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { subject, body, ctaLabel, ctaUrl } = parsed.data;
  if ((ctaLabel && !ctaUrl) || (!ctaLabel && ctaUrl)) {
    return { ok: false, error: "Para el botón, indica etiqueta y URL." };
  }
  if (ctaUrl && !/^https?:\/\//i.test(ctaUrl)) {
    return { ok: false, error: "La URL del botón debe empezar por http:// o https://" };
  }
  const result = await sendBroadcast({
    subject,
    body,
    ctaLabel: ctaLabel || undefined,
    ctaUrl: ctaUrl || undefined,
  });
  return { ok: true, result };
}
