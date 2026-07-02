import "server-only";
import { getServiceSupabase } from "./supabase-server";
import { getAllBooks } from "./books-data";

/* ============================================================
   Admin / CRM read queries (service role). Never cached — the
   admin always sees fresh data. Pages using these set
   `dynamic = "force-dynamic"`. Small data sets → aggregate in JS.
   ============================================================ */

export interface DashboardStats {
  revenueCents: number;
  paidOrders: number;
  customers: number;
  subscribers: number;
  books: number;
  configured: boolean;
}

export interface AdminOrder {
  id: string;
  userId: string | null;
  email: string | null;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: { bookId: string; title: string; priceCents: number }[];
}

export interface AdminCustomer {
  userId: string;
  email: string | null;
  displayName: string | null;
  orders: number;
  spentCents: number;
  ownedBooks: number;
  joinedAt: string | null;
}

export interface AdminSubscriber {
  id: number;
  email: string;
  status: string;
  source: string | null;
  createdAt: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const sb = getServiceSupabase();
  const allBooks = await getAllBooks();
  if (!sb) {
    return { revenueCents: 0, paidOrders: 0, customers: 0, subscribers: 0, books: allBooks.length, configured: false };
  }
  const [orders, entitlements, subs] = await Promise.all([
    sb.from("orders").select("total_cents, status, user_id"),
    sb.from("entitlements").select("user_id"),
    sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
  ]);
  const paid = (orders.data ?? []).filter((o) => o.status === "paid");
  const revenueCents = paid.reduce((s, o) => s + (o.total_cents ?? 0), 0);
  const customers = new Set((entitlements.data ?? []).map((e) => e.user_id)).size;
  return {
    revenueCents,
    paidOrders: paid.length,
    customers,
    subscribers: subs.count ?? 0,
    books: allBooks.length,
    configured: true,
  };
}

export async function getAllOrders(): Promise<AdminOrder[]> {
  const sb = getServiceSupabase();
  if (!sb) return [];
  const [{ data: orders }, books] = await Promise.all([
    sb
      .from("orders")
      .select("id, user_id, email, status, total_cents, currency, created_at, order_items(book_id, price_cents)")
      .order("created_at", { ascending: false }),
    getAllBooks(),
  ]);
  const titleOf = new Map(books.map((b) => [b.id, b.title]));
  return (orders ?? []).map((o) => ({
    id: o.id as string,
    userId: (o.user_id as string | null) ?? null,
    email: (o.email as string | null) ?? null,
    status: o.status as string,
    totalCents: (o.total_cents as number) ?? 0,
    currency: (o.currency as string) ?? "EUR",
    createdAt: o.created_at as string,
    items: ((o.order_items as { book_id: string; price_cents: number }[] | null) ?? []).map((it) => ({
      bookId: it.book_id,
      title: titleOf.get(it.book_id) ?? it.book_id,
      priceCents: it.price_cents,
    })),
  }));
}

export async function getAllCustomers(): Promise<AdminCustomer[]> {
  const sb = getServiceSupabase();
  if (!sb) return [];
  const [{ data: profiles }, { data: orders }, { data: ents }] = await Promise.all([
    sb.from("profiles").select("id, email, display_name, created_at"),
    sb.from("orders").select("user_id, total_cents, status"),
    sb.from("entitlements").select("user_id, granted_at"),
  ]);

  // Union of every user id we've seen (profile, order, or entitlement).
  const ids = new Set<string>();
  for (const p of profiles ?? []) ids.add(p.id as string);
  for (const o of orders ?? []) if (o.user_id) ids.add(o.user_id as string);
  for (const e of ents ?? []) ids.add(e.user_id as string);

  const profileOf = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  return [...ids]
    .map((id) => {
      const p = profileOf.get(id);
      const userOrders = (orders ?? []).filter((o) => o.user_id === id && o.status === "paid");
      const userEnts = (ents ?? []).filter((e) => e.user_id === id);
      const joined =
        (p?.created_at as string | undefined) ??
        userEnts.map((e) => e.granted_at as string).sort()[0] ??
        null;
      return {
        userId: id,
        email: (p?.email as string | null) ?? null,
        displayName: (p?.display_name as string | null) ?? null,
        orders: userOrders.length,
        spentCents: userOrders.reduce((s, o) => s + ((o.total_cents as number) ?? 0), 0),
        ownedBooks: userEnts.length,
        joinedAt: joined,
      };
    })
    .sort((a, b) => b.spentCents - a.spentCents);
}

export async function getAllSubscribers(): Promise<AdminSubscriber[]> {
  const sb = getServiceSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("id, email, status, source, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []).map((s) => ({
    id: s.id as number,
    email: s.email as string,
    status: s.status as string,
    source: (s.source as string | null) ?? null,
    createdAt: s.created_at as string,
  }));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** All books incl. unpublished — raw rows for the CMS table/forms. */
export async function getAllBooksAdmin(): Promise<any[]> {
  const sb = getServiceSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("books")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getBookAdmin(id: string): Promise<any | null> {
  const sb = getServiceSupabase();
  if (!sb) return null;
  const { data } = await sb.from("books").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
