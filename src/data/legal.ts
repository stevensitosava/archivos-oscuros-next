/* ============================================================
   Business / legal details used across the legal pages.
   👉 REPLACE every [BRACKETED] value below with your real, registered
   details before going live. Anything left bracketed renders highlighted
   in ember on the page so it's impossible to ship by accident.

   `filled: false` shows a visible "borrador / placeholders" notice on each
   legal page. Set it to `true` once you've replaced the values.
   ============================================================ */

export const LEGAL = {
  filled: true,

  // Trading / brand name shown to customers
  brand: "Archivos Oscuros",

  // Legal operator (person or company running the store)
  operator: "Archivos Oscuros",
  // Empty values are HIDDEN on the legal pages (conditional list items), so a
  // sole operator without a NIF/registry doesn't render blank fields.
  taxId: "",
  address: "Cádiz",
  country: "España",

  // Contact
  email: "thec24623@gmail.com",
  // Optional: registry data if you're a registered company (S.L., etc.)
  registry: "",

  // The site this applies to
  domain: "www.archivososcuros.com",

  // Last review date shown on each page (update when you edit the texts)
  updated: "2 de julio de 2026",
};

/** Whether a value is still an unresolved [PLACEHOLDER]. */
export function isPlaceholder(value: string): boolean {
  return /\[.*\]/.test(value);
}
