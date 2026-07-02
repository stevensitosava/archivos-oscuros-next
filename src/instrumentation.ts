/**
 * Runs once at server startup (Next.js instrumentation). Fails fast on a
 * half-configured Stripe setup so the client UI gate (publishable key) and the
 * server payment gate (secret key) can never be satisfiable independently — the
 * divergence that would otherwise let a missing secret key degrade into a
 * free-grant hole.
 */
export async function register() {
  const pk = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const sk = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const wh = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
  const isProd = process.env.NODE_ENV === "production";

  if (pk !== sk) {
    const msg =
      "[env] Stripe is half-configured: set BOTH NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY together (or neither).";
    if (isProd) throw new Error(msg);
    console.warn(msg);
  }
  if (sk && !wh) {
    console.warn(
      "[env] STRIPE_WEBHOOK_SECRET missing — the webhook is disabled; fulfillment relies on the /compra/exito confirm fallback. Set it via `stripe listen` or a dashboard endpoint.",
    );
  }

  // Clerk — publishable + secret must be set together (auth is off until both).
  const cpk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
  const csk = Boolean(process.env.CLERK_SECRET_KEY?.trim());
  if (cpk !== csk) {
    console.warn(
      "[env] Clerk is half-configured: set BOTH NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY (or neither). Auth stays disabled until both are present.",
    );
  }

  // Supabase — the browser client (url + anon) and the privileged server client.
  const surl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const sanon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const ssvc = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  if ((surl || sanon || ssvc) && !(surl && sanon && ssvc)) {
    console.warn(
      "[env] Supabase is partially configured: set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY together. DB features stay disabled until all three are present.",
    );
  }

  // Production sanity — the public origin drives Stripe redirects, canonical URLs and HSTS upgrade.
  if (isProd) {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
    if (!site.startsWith("https://") || site.includes("localhost")) {
      console.warn(
        "[env] NEXT_PUBLIC_SITE_URL should be your public https URL in production (used for Stripe redirects, canonical URLs and OG tags).",
      );
    }
  }
}
