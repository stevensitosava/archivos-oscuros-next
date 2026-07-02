"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";

/** Storefront chrome (grain + nav + footer + cookie banner) on public routes;
 *  bare passthrough on /admin so the admin layout owns its own full-screen UI. */
export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "";
  if (path.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <div className="grain" aria-hidden="true" />
        <Nav />
        <main className="relative z-10 flex-1 pt-24">{children}</main>
        <Footer />
      </div>
      <CookieConsent />
    </>
  );
}
