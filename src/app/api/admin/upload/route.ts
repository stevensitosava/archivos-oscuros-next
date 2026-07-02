import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-server";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

/** Verify real image type by magic bytes (don't trust the client Content-Type). */
function sniffImage(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return { ext: "png", mime: "image/png" };
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return { ext: "jpg", mime: "image/jpeg" };
  const head6 = buf.length >= 6 ? buf.toString("ascii", 0, 6) : "";
  if (head6 === "GIF87a" || head6 === "GIF89a") return { ext: "gif", mime: "image/gif" };
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return { ext: "webp", mime: "image/webp" };
  return null;
}

/**
 * POST /api/admin/upload  (multipart: file, kind)
 *  kind="cover" → public 'covers' bucket → returns { value: publicUrl }
 *  kind="ebook" → private 'ebooks' bucket → returns { value: storagePath }
 * Admin only.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const sb = getServiceSupabase();
  if (!sb) return NextResponse.json({ error: "Base de datos no conectada." }, { status: 400 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  if (kind !== "cover" && kind !== "ebook") return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "Archivo vacío." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Archivo demasiado grande (máx 30 MB)." }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const rand = Math.random().toString(36).slice(2, 8);

  if (kind === "cover") {
    // Validate by magic bytes — the client Content-Type is not trusted, since the
    // covers bucket is PUBLIC and would otherwise be free hosting for any payload.
    const sniffed = sniffImage(buf);
    if (!sniffed) {
      return NextResponse.json({ error: "La portada debe ser una imagen válida (PNG, JPEG, WebP o GIF)." }, { status: 400 });
    }
    const objectName = `cover-${Date.now()}-${rand}.${sniffed.ext}`;
    await sb.storage.createBucket("covers", { public: true }); // idempotent; ignores already-exists
    const { error } = await sb.storage
      .from("covers")
      .upload(objectName, buf, { contentType: sniffed.mime, upsert: false }); // sniffed type, not client's
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = sb.storage.from("covers").getPublicUrl(objectName);
    return NextResponse.json({ ok: true, value: data.publicUrl });
  }

  // ebook → PRIVATE bucket; served only via signed URL after an ownership check.
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const objectName = `ebook-${Date.now()}-${rand}.${ext}`;
  const { error } = await sb.storage
    .from("ebooks")
    .upload(objectName, buf, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, value: objectName });
}
