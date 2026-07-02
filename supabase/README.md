# Database setup (Supabase)

The app runs in **demo mode** with no database (entitlements live in
`localStorage`, downloads serve the public sample PDFs). To enable the real
backend — per-user libraries, real orders, entitlement-gated downloads —
provision Supabase and add the keys.

## 1. Create a project
[supabase.com](https://supabase.com) → New project. Copy from **Settings → API**:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)

Put them in `.env.local`.

## 2. Run the schema + seed
Supabase **SQL Editor** → run `schema.sql`, then `seed.sql`.
(Or `supabase db push` with the CLI.)

## 3. Create the private storage bucket
**Storage → New bucket** → name `ebooks`, **Public = OFF**.
Upload the ebook files named to match `books.storage_path`:
`ao-001.pdf`, `ao-002.pdf`, … `ao-006.pdf`.

Do **not** add a public read policy on the bucket — downloads are gated by
entitlements and delivered through short-lived signed URLs from `/api/download`.

## 4. (Optional) public covers bucket
Covers are already served from `/public/*.webp`, so this isn't needed unless
you move them to Supabase.

## Auth & authorization model
- **Clerk** handles authentication; user ids are Clerk `text` ids (not Supabase
  Auth UUIDs). There is no `auth.users` dependency.
- All privileged DB access happens **server-side** in Next.js with the
  `service_role` key (bypasses RLS), scoped by the caller's Clerk user id from
  `auth()`. See `src/lib/db.ts`.
- RLS is enabled as defense-in-depth: `books` is public read-only; everything
  else has no anon/authenticated policy (service-role only).

## What writes what
- `/api/stripe/checkout` → creates a `pending` order (Stripe step).
- `/api/stripe/webhook` → flips the order to `paid` + grants `entitlements`.
- `/api/download` → verifies entitlement, returns a signed URL.
