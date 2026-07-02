"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";

/**
 * Nav auth controls.
 * - Signed out (or demo mode): "Acceso" (login) + "Crear cuenta" (sign up),
 *   which NAVIGATE to the dedicated /acceso and /registro pages (full-page
 *   Clerk widgets — not a modal).
 * - Signed in: the "Biblioteca" link (authenticated users only) + UserButton.
 *
 * `onNavigate` fires only from the LINKS (mobile menu uses it to close itself).
 * It must NOT wrap the UserButton: a bubbled click there would close the menu,
 * unmount the UserButton, and its just-opened popover (with "Cerrar sesión")
 * would vanish before the user can tap it.
 */
export default function AuthControls({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const signedOut = (
    <>
      <Link href="/acceso" className={className} onClick={onNavigate}>Acceso</Link>
      <Link href="/registro" className={className} onClick={onNavigate}>Crear cuenta</Link>
    </>
  );

  if (!isClerkConfigured) return signedOut;

  return (
    <>
      <Show when="signed-out">{signedOut}</Show>
      <Show when="signed-in">
        <Link href="/biblioteca" className={className} onClick={onNavigate}>Biblioteca</Link>
        <UserButton />
      </Show>
    </>
  );
}
