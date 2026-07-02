/** Row shapes matching supabase/schema.sql. */

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface ProfileRow {
  id: string; // Clerk user id
  email: string | null;
  display_name: string | null;
  created_at: string;
}

export interface BookRow {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price_cents: number;
  currency: string;
  storage_path: string | null;
  stripe_price_id: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  stripe_session_id: string | null;
  created_at: string;
}

export interface EntitlementRow {
  id: number;
  user_id: string;
  book_id: string;
  order_id: string | null;
  granted_at: string;
}
