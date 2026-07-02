-- ============================================================
-- ARCHIVOS OSCUROS — book catalog seed
-- Keep in sync with src/data/catalog.ts (same ids / slugs / prices).
-- storage_path is the BARE key inside the private 'ebooks' bucket
-- (do NOT add an 'ebooks/' prefix — createSignedUrl already scopes it).
-- Re-runnable (upsert).
-- ============================================================

-- Pricing (2026-07): ao-001 is the FREE lead magnet; every paid title is 4,99 €.
-- Bundle discounts (3 → 9,99 · 5 → 14,99) live in src/data/bundles.ts, not here.
insert into public.books (id, slug, title, author, category, price_cents, currency, storage_path) values
  ('ao-001', 'el-codigo-del-guerrero',          'El Código del Guerrero',          'Archivos Oscuros', 'guerreros',  0,   'EUR', 'ao-001.pdf'),
  ('ao-002', 'el-estoico-moderno',              'El Estoico Moderno',              'Archivos Oscuros', 'estoicismo', 499, 'EUR', 'ao-002.pdf'),
  ('ao-003', 'el-manual-del-legionario-romano', 'El Manual del Legionario Romano', 'Archivos Oscuros', 'historia',   499, 'EUR', 'ao-003.pdf'),
  ('ao-004', 'la-filosofia-vikinga',            'La Filosofía Vikinga',            'Archivos Oscuros', 'filosofia',  499, 'EUR', 'ao-004.pdf'),
  ('ao-005', 'la-mente-del-samurai',            'La Mente del Samurái',            'Archivos Oscuros', 'guerreros',  499, 'EUR', 'ao-005.pdf'),
  ('ao-006', 'sangre-espartana',                'Sangre Espartana',                'Archivos Oscuros', 'historia',   499, 'EUR', 'ao-006.pdf')
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  author = excluded.author,
  category = excluded.category,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  storage_path = excluded.storage_path;
