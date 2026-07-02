import "server-only";
import { getServiceSupabase } from "./supabase-server";
import type { OrderRow, OrderStatus } from "./db-types";
import { SITE_URL } from "./env";
import { formatPrice } from "./format";
import { sendEmail, renderEmail } from "./email";
import { unsubscribeUrl } from "./unsubscribe";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

/** Order receipt with download CTA. Best-effort (sendEmail never throws). */
async function sendPurchaseEmail(email: string, bookIds: string[], totalCents: number, currency: string): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb) return;
  const { data } = await sb.from("books").select("id, title").in("id", bookIds);
  const titles = (data ?? []).map((b) => b.title as string);
  if (titles.length === 0) return;
  const rows = titles
    .map(
      (t) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #26262a;font-family:'Poppins',Arial,sans-serif;font-size:14px;color:#ececed;">${escapeHtml(t)}</td></tr>`,
    )
    .join("");
  const bodyHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 2px;">${rows}<tr><td style="padding:14px 0 0;font-family:'Poppins',Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;">Total pagado — ${formatPrice(totalCents, currency)}</td></tr></table>`;
  const html = renderEmail({
    preheader: "Tu pedido de Archivos Oscuros ya está disponible para descargar.",
    heading: "Gracias por tu compra",
    paragraphs: ["Tu pago se ha confirmado. Estos son los títulos de tu pedido, listos para descargar cuando quieras:"],
    bodyHtml,
    cta: { label: "Descargar mis libros", url: `${SITE_URL}/biblioteca` },
  });
  await sendEmail({ to: email, subject: "Tu pedido — Archivos Oscuros", html });
}

/** Lead-magnet welcome with the free book + one-click unsubscribe. Best-effort. */
async function sendWelcomeEmail(email: string): Promise<void> {
  const url = unsubscribeUrl(email);
  const html = renderEmail({
    preheader: "Tu ejemplar gratuito te espera dentro.",
    heading: "Bienvenido al archivo",
    paragraphs: [
      "Gracias por unirte. Cada semana compartimos una lección de quienes vivieron —y murieron— por su código: guerreros, estoicos y estrategas de la historia.",
      "Empieza por nuestro ejemplar gratuito:",
    ],
    cta: { label: "Leer «El Código del Guerrero»", url: `${SITE_URL}/libro/el-codigo-del-guerrero` },
    unsubscribeUrl: url,
  });
  await sendEmail({ to: email, subject: "Bienvenido a Archivos Oscuros", html, headers: { "List-Unsubscribe": `<${url}>` } });
}

/* ============================================================
   Server-side data access (service role — BYPASSES RLS).
   Authorization is enforced HERE: every call is scoped by the
   caller's Clerk user id (resolved from auth() before calling).
   All functions degrade gracefully to empty/no-op in demo mode
   (no Supabase keys → getServiceSupabase() returns null).
   ============================================================ */

/** Book ids the user owns (entitlements). */
export async function getOwnedBookIds(userId: string): Promise<string[]> {
  const sb = getServiceSupabase();
  if (!sb || !userId) return [];
  const { data, error } = await sb.from("entitlements").select("book_id").eq("user_id", userId);
  if (error) {
    console.warn("[db] getOwnedBookIds:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.book_id as string);
}

/** Whether the user owns a specific book (download authorization). */
export async function ownsBook(userId: string, bookId: string): Promise<boolean> {
  const sb = getServiceSupabase();
  if (!sb || !userId) return false;
  const { data } = await sb
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  return Boolean(data);
}

/** Grant a download right (idempotent). Used by the Stripe webhook. */
export async function grantEntitlement(
  userId: string,
  bookId: string,
  orderId?: string | null,
): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb || !userId) return;
  const { error } = await sb
    .from("entitlements")
    .upsert(
      { user_id: userId, book_id: bookId, order_id: orderId ?? null },
      { onConflict: "user_id,book_id", ignoreDuplicates: true },
    );
  if (error) console.warn("[db] grantEntitlement:", error.message);
}

/** Private-bucket storage path for a book's ebook file. */
export async function getBookStoragePath(bookId: string): Promise<string | null> {
  const sb = getServiceSupabase();
  if (!sb) return null;
  const { data } = await sb.from("books").select("storage_path").eq("id", bookId).maybeSingle();
  return (data?.storage_path as string | undefined) ?? null;
}

/** Upsert a profile row for a Clerk user (lazy sync). */
export async function upsertProfile(
  userId: string,
  email?: string | null,
  displayName?: string | null,
): Promise<void> {
  const sb = getServiceSupabase();
  if (!sb || !userId) return;
  const { error } = await sb
    .from("profiles")
    .upsert({ id: userId, email: email ?? null, display_name: displayName ?? null }, { onConflict: "id" });
  if (error) console.warn("[db] upsertProfile:", error.message);
}

export interface NewOrderInput {
  userId?: string | null;
  email?: string | null;
  totalCents: number;
  currency?: string;
  stripeSessionId?: string | null;
  status?: OrderStatus;
  items: { bookId: string; priceCents: number }[];
}

/** Create an order + its line items. Returns the order id (or null). */
export async function createOrder(input: NewOrderInput): Promise<string | null> {
  const sb = getServiceSupabase();
  if (!sb) return null;
  const { data: order, error } = await sb
    .from("orders")
    .insert({
      user_id: input.userId ?? null,
      email: input.email ?? null,
      total_cents: input.totalCents,
      currency: input.currency ?? "EUR",
      stripe_session_id: input.stripeSessionId ?? null,
      status: input.status ?? "pending",
    })
    .select("id")
    .single();
  if (error || !order) {
    console.warn("[db] createOrder:", error?.message);
    return null;
  }
  const orderId = order.id as string;
  if (input.items.length) {
    const rows = input.items.map((it) => ({
      order_id: orderId,
      book_id: it.bookId,
      price_cents: it.priceCents,
    }));
    const { error: itemsErr } = await sb.from("order_items").insert(rows);
    if (itemsErr) console.warn("[db] createOrder items:", itemsErr.message);
  }
  return orderId;
}

/**
 * Fulfill a paid Stripe checkout: flip the order to paid and grant entitlements.
 * Idempotent. Robust to the order row racing/missing (grants from the session
 * metadata instead). The authz subject and the grant target are the SAME id:
 * `userId` comes from the session metadata; in the confirm path the caller also
 * passes `expectedUserId` (the authenticated user) which must match.
 * Returns false on a write failure so the webhook can return 5xx → Stripe retries.
 */
export async function fulfillCheckout(params: {
  stripeSessionId: string;
  userId: string; // owner, from session.metadata.userId
  bookIds: string[]; // from session.metadata.bookIds
  expectedUserId?: string; // confirm path: the authenticated caller (must equal owner)
}): Promise<boolean> {
  const sb = getServiceSupabase();
  if (!sb) return false;
  const { stripeSessionId, userId, bookIds, expectedUserId } = params;
  if (!userId || bookIds.length === 0) return false;
  if (expectedUserId && expectedUserId !== userId) return false; // bind authz ↔ grant

  const { data: order } = await sb
    .from("orders")
    .select("id, user_id, status, email, total_cents, currency")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  let orderId: string | null = null;
  const owner = (order?.user_id as string | null) || userId;
  if (order && expectedUserId && owner !== expectedUserId) return false; // order belongs to someone else

  // Did WE flip pending→paid this call? The conditional UPDATE (…neq status paid)
  // returns the row only for the caller that won the race, so the confirmation
  // email fires exactly once even when the webhook and the confirm fallback both run.
  let firstPaid = false;
  if (order) {
    orderId = order.id as string;
    if (order.status !== "paid") {
      const { data: flipped, error } = await sb
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id)
        .neq("status", "paid")
        .select("id");
      if (error) {
        console.warn("[db] fulfillCheckout: status update failed:", error.message);
        return false;
      }
      firstPaid = (flipped?.length ?? 0) > 0;
    }
  } else {
    // Webhook raced ahead of createOrder (or it failed) — grant from metadata; the
    // pending order created at checkout still records the purchase for audit.
    console.warn("[db] fulfillCheckout: no order row for session", stripeSessionId, "— granting from metadata");
  }

  let allOk = true;
  for (const bookId of bookIds) {
    const { error } = await sb
      .from("entitlements")
      .upsert(
        { user_id: owner, book_id: bookId, order_id: orderId },
        { onConflict: "user_id,book_id", ignoreDuplicates: true },
      );
    if (error) {
      console.warn("[db] fulfillCheckout: grant failed:", bookId, error.message);
      allOk = false;
    }
  }

  // Purchase confirmation — only on the first transition, only if we have an email.
  if (firstPaid && order?.email) {
    await sendPurchaseEmail(
      order.email as string,
      bookIds,
      (order.total_cents as number) ?? 0,
      (order.currency as string) ?? "EUR",
    );
  }
  return allOk;
}

/** Newsletter signup. Idempotent on email. Demo mode (no DB) accepts gracefully.
 *  `consent` records opt-in (terms + marketing) with a timestamp for GDPR audit. */
export async function subscribeNewsletter(
  email: string,
  source?: string | null,
  consent?: boolean,
): Promise<"ok" | "exists" | "error"> {
  const sb = getServiceSupabase();
  if (!sb) return "ok"; // demo mode — nothing stored, but the UI still works
  const { error } = await sb.from("newsletter_subscribers").insert({
    email,
    source: source ?? null,
    consent_at: consent ? new Date().toISOString() : null,
  });
  if (error) {
    if (error.code === "23505") return "exists"; // unique email violation
    console.warn("[db] subscribeNewsletter:", error.message);
    return "error";
  }
  // First-time subscriber → welcome email (best-effort). Skipped for checkout,
  // which already sends its own purchase confirmation.
  if (source !== "checkout") {
    await sendWelcomeEmail(email);
  }
  return "ok";
}

/** Emails eligible for marketing broadcasts: still subscribed AND consented. */
export async function getConsentingSubscriberEmails(): Promise<string[]> {
  const sb = getServiceSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "subscribed")
    .not("consent_at", "is", null);
  return (data ?? []).map((r) => r.email as string);
}

/** Mark an email unsubscribed (case-insensitive). Idempotent. */
export async function unsubscribeEmail(email: string): Promise<boolean> {
  const sb = getServiceSupabase();
  if (!sb) return true; // demo mode — nothing stored
  const { error } = await sb
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed" })
    .ilike("email", email.trim());
  if (error) {
    console.warn("[db] unsubscribeEmail:", error.message);
    return false;
  }
  return true;
}

/** A user's orders, newest first. */
export async function getUserOrders(userId: string): Promise<OrderRow[]> {
  const sb = getServiceSupabase();
  if (!sb || !userId) return [];
  const { data } = await sb
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as OrderRow[] | null) ?? [];
}
