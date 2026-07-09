import type { NextConfig } from "next";

/* ============================================================
   Content-Security-Policy
   Static host allow-list (no per-request nonce — keeps static
   rendering and avoids breaking Clerk's client SDK). script-src
   carries 'unsafe-inline' because Next's App Router inlines its
   hydration/RSC bootstrap scripts and a static CSP can't hash
   them; every other directive is locked to known hosts.
   Allow-listed: Clerk (auth + Turnstile bot challenge), Supabase
   (REST/realtime/storage), Stripe API. WebGL needs 'wasm-unsafe-
   eval' + worker blob:. Dev mode adds 'unsafe-eval' + ws/http
   localhost for Fast Refresh; upgrade-insecure-requests only on
   an https site URL so local `next start` isn't broken.
   ============================================================ */
const isDev = process.env.NODE_ENV !== "production";
const isHttpsSite = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

// Production Clerk serves its Frontend API + account portal from custom domains
// (clerk.<yourdomain> / accounts.<yourdomain>). Allow-list them so switching from
// the dev instance (pk_test) to production (pk_live) is NOT blocked by the CSP.
// If you pick a different Clerk subdomain, change these.
const CLERK_FAPI = "https://clerk.archivososcuros.com";
const CLERK_ACCOUNTS = "https://accounts.archivososcuros.com";

function contentSecurityPolicy(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    CLERK_FAPI,
    "https://challenges.cloudflare.com",
    isDev ? "'unsafe-eval'" : "",
  ].filter(Boolean);

  const connectSrc = [
    "'self'",
    "blob:", // three.js GLTFLoader fetches packed textures via blob: URLs
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    CLERK_FAPI,
    "https://clerk-telemetry.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://api.stripe.com",
    isDev ? "ws://localhost:*" : "",
    isDev ? "http://localhost:*" : "",
  ].filter(Boolean);

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://img.clerk.com https://*.clerk.com https://*.supabase.co ${CLERK_FAPI}`,
    "media-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com ${CLERK_FAPI} ${CLERK_ACCOUNTS}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action 'self' https://*.clerk.accounts.dev https://*.clerk.com ${CLERK_FAPI}`,
    "frame-ancestors 'none'",
    ...(!isDev && isHttpsSite ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

// Safe, broadly-compatible security headers.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF, then WebP, then the original — modern formats, smaller bytes.
    formats: ["image/avif", "image/webp"],
    // Allow optimizing admin-uploaded covers hosted on Supabase public storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The stable production alias serves a full duplicate of the site.
      // Canonicals already point home, but a 308 removes the duplicate host
      // outright. Exact-host match only — deployment-specific preview URLs
      // (archivos-oscuros-next-<hash>…vercel.app) stay reachable for QA.
      {
        source: "/:path*",
        has: [{ type: "host", value: "archivos-oscuros-next.vercel.app" }],
        destination: "https://www.archivososcuros.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
