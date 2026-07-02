# Archivos Oscuros

Tienda digital de ebooks en español sobre **estoicismo, historia militar y los códigos de los grandes guerreros** (samuráis, vikingos, Esparta, Roma). Entrega 100% digital en PDF, con descarga inmediata.

> **⚠️ Uso restringido — prohibido el uso comercial.** Ver [Licencia](#licencia--license) más abajo.

Producción: **https://www.archivososcuros.com**

---

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** · **Tailwind v4**
- **Clerk** — autenticación
- **Supabase** — base de datos + almacenamiento privado de los ebooks (URLs firmadas)
- **Stripe** — pagos (Checkout + webhook)
- **Resend** — correos transaccionales y campañas
- **Vercel** — hosting, Analytics y Speed Insights

## Características

- Catálogo dirigido por base de datos + panel de administración (CMS de libros + CRM de pedidos/clientes/boletín)
- Carrito con **ofertas por lotes** (packs) y **ofertas relámpago** basadas en tiempo
- Descargas seguras por URL firmada, protegidas por compra
- Correos de confirmación de compra, bienvenida y campañas de boletín (con baja en un clic)
- Páginas legales (RGPD/LSSI), consentimiento de cookies
- SEO + GEO: JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`, OpenGraph por libro
- Limitación de peticiones, CSP y cabeceras de seguridad
- **30 pruebas unitarias** (Vitest) + **9 E2E** (Playwright) + CI en GitHub Actions

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
```

La app arranca en **modo demo** sin claves (datos de ejemplo, sin pagos reales). Para el modo completo, define en `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
RESEND_API_KEY / EMAIL_FROM
ADMIN_USER_IDS
```

> Las claves reales viven solo en `.env.local`, que está en `.gitignore` y **nunca** se sube al repositorio.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas E2E (Playwright) |
| `npm run typecheck` | Comprobación de tipos |

---

## Licencia / License

**© 2026 Archivos Oscuros. Todos los derechos reservados. — All rights reserved.**

Este código fuente se publica únicamente con fines de **referencia y consulta**.
This source code is published for **reference and viewing purposes only**.

🚫 **Queda prohibido el uso comercial. — Commercial use is strictly prohibited.**

No está permitido usar, copiar, modificar, redistribuir, vender, sublicenciar ni desplegar este código —ni en su totalidad ni en parte— con fines comerciales, sin el consentimiento **expreso y por escrito** del titular de los derechos.

You may **not** use, copy, modify, redistribute, sell, sublicense or deploy this code — in whole or in part — for any commercial purpose, without the **express written permission** of the copyright holder.
