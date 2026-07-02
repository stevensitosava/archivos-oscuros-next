-- ============================================================
-- ARCHIVOS OSCUROS — Supabase / Postgres schema (Clerk auth)
-- Run in the Supabase SQL editor (or `supabase db push`).
--
-- AUTH MODEL: authentication is handled by CLERK, not Supabase Auth.
-- User ids are Clerk user ids (text, e.g. "user_2abc..."), NOT auth.users
-- UUIDs. There is no auth.users table reference and no signup trigger.
--
-- AUTHORIZATION: every privileged read/write happens server-side in Next.js
-- using the SERVICE ROLE key (which BYPASSES RLS), scoped by the caller's
-- Clerk user id (from `auth()`). RLS is enabled as defense-in-depth with NO
-- public write policies; the only public access is read-only on `books`.
--
-- The real ebook files live in a PRIVATE storage bucket ('ebooks') and are
-- served only through short-lived signed URLs by /api/download after the
-- server confirms the caller's entitlement.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- profiles — optional public-facing user data, keyed by Clerk user id
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           text primary key,            -- Clerk user id
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- books — catalog mirror of src/data/catalog.ts
--   id MUST match the frontend Book.id ("ao-001" ...).
--   storage_path = path inside the private 'ebooks' bucket.
-- ------------------------------------------------------------
create table if not exists public.books (
  id              text primary key,
  slug            text unique not null,
  title           text not null,
  author          text not null,
  category        text not null,
  price_cents     int  not null,
  currency        text not null default 'EUR',
  storage_path    text,                 -- path in the private 'ebooks' bucket
  stripe_price_id text,                 -- nullable; falls back to dynamic price
  -- Full display content (catalog is DB-authoritative; managed from /admin) --
  tagline         text not null default '',
  synopsis        text not null default '',
  pages           int  not null default 0,
  year            int  not null default 2025,
  language        text not null default 'Español',
  tags            text[] not null default '{}',
  formats         text[] not null default '{}',
  cover_bg        text not null default '#171717',
  cover_ink       text not null default '#ececee',
  cover_motif     text not null default 'skull',
  cover_image     text,                 -- optional real cover (overrides procedural)
  featured        boolean not null default false,
  rating          numeric(2,1) not null default 0,
  sort_order      int not null default 0,  -- manual ordering in catalog/admin
  published       boolean not null default true,  -- hidden from storefront when false
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- orders — one row per checkout attempt
-- ------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           text,                              -- Clerk user id (nullable: guest)
  email             text,
  status            text not null default 'pending'
                      check (status in ('pending','paid','failed','refunded')),
  total_cents       int  not null,
  currency          text not null default 'EUR',
  stripe_session_id text unique,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- order_items — line items of an order
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  book_id     text not null references public.books (id),
  price_cents int  not null
);

-- ------------------------------------------------------------
-- entitlements — proof a user owns a book (download right)
--   unique(user_id, book_id): a user owns each book at most once.
-- ------------------------------------------------------------
create table if not exists public.entitlements (
  id         bigint generated always as identity primary key,
  user_id    text not null,                            -- Clerk user id
  book_id    text not null references public.books (id),
  order_id   uuid references public.orders (id),
  granted_at timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ------------------------------------------------------------
-- newsletter_subscribers — email signups (Phase 3)
-- ------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id            bigint generated always as identity primary key,
  email         text unique not null,
  status        text not null default 'subscribed'
                  check (status in ('subscribed','unsubscribed')),
  source        text,
  consent_at    timestamptz,   -- when the user accepted terms + marketing opt-in
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- rate_limits — durable fixed-window request counters (NO Redis).
--   Keyed by (id, window_start). Written ONLY by the service role,
--   exclusively through rate_limit_hit() below. Survives across
--   serverless instances because it lives in the shared database.
-- ------------------------------------------------------------
create table if not exists public.rate_limits (
  id           text   not null,   -- e.g. "checkout:user_2abc" or "download:1.2.3.4"
  window_start bigint not null,   -- epoch seconds, floored to the window size
  count        int    not null default 0,
  primary key (id, window_start)
);

-- Atomic "hit": bump the counter for (id, current window) and return the new
-- count in a single race-safe statement. ~1% of calls sweep stale rows, so the
-- table self-maintains without pg_cron.
create or replace function public.rate_limit_hit(
  p_id text, p_window_start bigint, p_ttl_seconds int
) returns int
language plpgsql
set search_path = public
as $$
declare
  new_count int;
begin
  insert into public.rate_limits (id, window_start, count)
  values (p_id, p_window_start, 1)
  on conflict (id, window_start)
  do update set count = rate_limits.count + 1
  returning count into new_count;

  if random() < 0.01 then
    delete from public.rate_limits
    where window_start < (extract(epoch from now())::bigint - greatest(p_ttl_seconds, 3600));
  end if;

  return new_count;
end;
$$;

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists entitlements_user_idx on public.entitlements (user_id);
create index if not exists orders_user_idx        on public.orders (user_id);
create index if not exists order_items_order_idx   on public.order_items (order_id);

-- ============================================================
-- Row Level Security (defense-in-depth; the service role bypasses it)
-- ============================================================
alter table public.profiles               enable row level security;
alter table public.books                  enable row level security;
alter table public.orders                  enable row level security;
alter table public.order_items             enable row level security;
alter table public.entitlements            enable row level security;
alter table public.newsletter_subscribers  enable row level security;
alter table public.rate_limits             enable row level security;

-- books: catalog is PUBLIC read-only (anon + authenticated). All writes are
-- service-role only (no policy = denied for anon/authenticated).
drop policy if exists "books: public read" on public.books;
create policy "books: public read"
  on public.books for select
  to anon, authenticated
  using (true);

-- profiles / orders / order_items / entitlements / newsletter:
-- NO anon/authenticated policies → all access is service-role only (server).
