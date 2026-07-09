import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ownsBook, getBookStoragePath, grantEntitlement, subscribeNewsletter, sendFreeClaimEmail } from "@/lib/db";
import { getServiceSupabase, isServiceSupabaseConfigured } from "@/lib/supabase-server";
import { getBookById } from "@/lib/books-data";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

/**
 * Lead-magnet funnel: the first time someone claims a FREE book, add their email
 * to the newsletter (source "free-book") and send the delivery email with the
 * pack pitch. Best-effort — a failure here must never block the download. This
 * is what turns free downloads into a mailing list and, later, into buyers.
 */
async function fulfillFreeClaim(bookTitle: string) {
  try {
    const user = await currentUser();
    const email =
      user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user?.emailAddresses[0]?.emailAddress;
    if (!email) return;
    await subscribeNewsletter(email, "free-book", true);
    await sendFreeClaimEmail(email, bookTitle);
  } catch (e) {
    console.warn("[download] free-claim fulfillment failed:", e instanceof Error ? e.message : e);
  }
}

/** Content-Disposition that names the file after the book, with a proper
 *  ASCII fallback + RFC 5987 UTF-8 form so accents survive ("Código"). */
function attachment(name: string): string {
  const ascii =
    name
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip diacritics for the fallback
      .replace(/[^\x20-\x7e]/g, "")
      .replace(/["\\]/g, "")
      .trim() || "descarga";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/**
 * GET /api/download?book=<id>
 * - Demo mode (no Supabase): a named placeholder text file.
 * - Real mode: require Clerk auth + entitlement, then stream the file from the
 *   private 'ebooks' bucket, named after the book. Proxied (not redirected) so
 *   the download keeps the book's filename and the signed URL never leaves the
 *   server.
 */
export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("book") ?? "";
  if (!/^[a-z0-9-]{1,64}$/i.test(bookId)) {
    return NextResponse.json({ error: "Parámetro 'book' inválido." }, { status: 400 });
  }

  const dl = await rateLimit(`download:${clientIp(req)}`, 30, 60);
  if (!dl.ok) {
    return NextResponse.json({ error: "Demasiadas descargas. Espera un momento." }, { status: 429 });
  }

  // ── Demo mode (no privileged server client) ──────────────
  // Serve a PLACEHOLDER, never the real ebook.
  if (!isServiceSupabaseConfigured) {
    const book = await getBookById(bookId);
    const title = book?.title ?? bookId;
    const text =
      `ARCHIVOS OSCUROS — descarga de demostración\n\n"${title}"\n\n` +
      `Este es un archivo de muestra. Configura Supabase + el bucket privado 'ebooks' ` +
      `para entregar el ebook real mediante una URL firmada y protegida por compra.\n`;
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": attachment(`${title} (demo).txt`),
      },
    });
  }

  // ── Real mode: auth + entitlement ─────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const [book, path] = await Promise.all([getBookById(bookId), getBookStoragePath(bookId)]);
  const sb = getServiceSupabase();
  if (!path || !sb) {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  // Must own it — EXCEPT free books, which are claimed on first download.
  if (!(await ownsBook(userId, bookId))) {
    if (book && book.priceCents === 0) {
      const granted = await grantEntitlement(userId, bookId, null);
      // First-time free claim → newsletter + delivery email (best-effort).
      // Gated on the grant: a persistent write failure must not re-send the
      // email on every retry click.
      if (granted) await fulfillFreeClaim(book.title);
    } else {
      return NextResponse.json({ error: "No posees este libro." }, { status: 403 });
    }
  }

  const { data, error } = await sb.storage.from("ebooks").createSignedUrl(path, 120);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "No se pudo generar la descarga." }, { status: 500 });
  }

  // Proxy the file so we control the download filename (the book's title).
  const upstream = await fetch(data.signedUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "No se pudo obtener el archivo." }, { status: 502 });
  }

  const ext = (path.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "pdf";
  const safeTitle = (book?.title ?? bookId).replace(/[\\/:*?"<>|]+/g, "").trim() || bookId;

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Content-Disposition", attachment(`${safeTitle}.${ext}`));
  headers.set("Cache-Control", "private, no-store");
  return new NextResponse(upstream.body, { status: 200, headers });
}
