import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth-server";
import { isClerkConfigured } from "@/lib/env";
import AdminNav from "./AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Demo mode (no Clerk) → admin is unavailable; behave as if it doesn't exist.
  if (!isClerkConfigured) notFound();

  if (!(await isAdmin())) {
    const { userId } = await auth();
    // Signed-out → send to sign-in (the proxy normally does this first).
    if (!userId) redirect("/acceso?redirect_url=/admin");
    // Signed-in but not an admin → 404, so regular users can't discover the
    // panel or how its gate works. (Find your Clerk user id in the Clerk
    // dashboard → Users to add it to ADMIN_USER_IDS.)
    notFound();
  }

  return (
    <div className="min-h-screen bg-ink-950 text-bone-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:gap-12">
        {/* Sidebar */}
        <aside className="lg:w-56 lg:shrink-0">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-ash-500">Archivos Oscuros</p>
              <p className="mt-0.5 text-[1.1rem] font-semibold text-bone-50">Panel</p>
            </div>
          </div>
          <div className="mt-6">
            <AdminNav />
          </div>
          <div className="mt-6 border-t border-bone-100/10 pt-4">
            <Link href="/" className="block px-3 py-2 text-[0.85rem] text-ash-500 transition-colors hover:text-bone-100">
              ← Volver a la tienda
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
