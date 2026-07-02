import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subscribeNewsletter } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const Schema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(254)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email inválido"),
  consent: z.boolean().optional(),
});

/** POST /api/newsletter { email } → { ok, status: "ok" | "exists" } */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`newsletter:${clientIp(req)}`, 5, 60);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Demasiadas peticiones." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida." }, { status: 400 });
  }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Email inválido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const result = await subscribeNewsletter(email, "footer", parsed.data.consent === true);
  if (result === "error") {
    return NextResponse.json({ ok: false, error: "No se pudo completar." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, status: result });
}
