"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";
import type { Book } from "@/types";
import { isClerkConfigured } from "@/lib/env";
import { trackEvent } from "@/lib/analytics";

/**
 * Free books get a direct "Descargar gratis" instead of a buy/cart control — no
 * paywall confusion. Downloading still requires sign-in (the /api/download route
 * grants the free entitlement on first download); signed-out users are sent to
 * sign-in and returned to the book.
 */
export default function FreeDownloadButton({
  book,
  size = "sm",
  redirectTo,
}: {
  book: Book;
  size?: "sm" | "lg";
  /** Where to return after sign-in (defaults to the book page). */
  redirectTo?: string;
}) {
  const downloadHref = `/api/download?book=${book.id}`;
  const signInHref = `/acceso?redirect_url=${encodeURIComponent(redirectTo ?? `/libro/${book.slug}`)}`;

  const cls =
    size === "lg"
      ? "btn btn-ember px-7 py-4 text-[0.85rem]"
      : "shrink-0 rounded-full bg-bone-50 px-3.5 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink-950 transition-colors hover:bg-white";
  const style = size === "sm" ? { fontFamily: "var(--font-ritual)" } : undefined;
  const label = size === "lg" ? "Descargar gratis" : "Descargar";

  const download = (
    <a
      href={downloadHref}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent("free_claim", { book: book.id, title: book.title })}
      className={cls}
      style={style}
    >
      {label}
    </a>
  );
  const signIn = (
    <Link href={signInHref} className={cls} style={style}>
      {label}
    </Link>
  );

  // Demo mode → no auth wall (the route serves a placeholder).
  if (!isClerkConfigured) return download;

  return (
    <>
      <Show when="signed-in">{download}</Show>
      <Show when="signed-out">{signIn}</Show>
    </>
  );
}
