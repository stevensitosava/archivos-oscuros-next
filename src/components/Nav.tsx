"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import Wordmark from "./Wordmark";
import AuthControls from "./AuthControls";
import { useCart } from "../store/cart";

// Public links only — "Biblioteca" is gated behind sign-in (see AuthControls).
// "Libro gratis" carries an ember dot: it's the primary ask for first-timers.
const LINKS: { to: string; label: string; accent?: boolean }[] = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/gratis", label: "Libro gratis", accent: true },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // While the menu is open: lock page scroll (position:fixed — overflow:hidden
  // alone doesn't stop touch-drag on iOS Safari), close on Escape, and close if
  // the viewport crosses the md breakpoint (the menu/backdrop/hamburger all go
  // display:none there, which would otherwise strand the page scroll-locked).
  useEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = (e: MediaQueryListEvent) => e.matches && setMenuOpen(false);
    mq.addEventListener("change", onMq);
    return () => {
      Object.assign(style, prev);
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      // "instant": html has scroll-behavior:smooth — a plain scrollTo would
      // visibly animate the position restore.
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [menuOpen]);

  return (
    // z-[70]: above the cookie banner (z-[60]) so the open menu + backdrop
    // aren't overlapped or tap-blocked by it.
    <header className="fixed inset-x-0 top-0 z-[70] px-4 pt-4 sm:px-6">
      <div
        className={`relative z-50 mx-auto flex max-w-7xl items-center justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "rounded-full border border-white/10 bg-ink-950/65 px-5 py-2.5 backdrop-blur-xl"
            : "px-1.5 py-3"
        }`}
      >
        {/* Tapping the wordmark while already on / doesn't change pathname —
            close the menu explicitly. */}
        <span onClick={() => setMenuOpen(false)} className="contents">
          <Wordmark className="relative z-10" />
        </span>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex"
          aria-label="Principal"
        >
          {LINKS.map((l) => {
            const isActive = pathname === l.to;
            return (
              <Link
                key={l.to}
                href={l.to}
                className={`inline-flex items-center gap-1.5 text-[0.72rem] font-light uppercase tracking-[0.2em] transition-colors duration-300 hover:text-white ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              >
                {l.accent && <span className="h-1.5 w-1.5 rounded-full bg-ember-500" aria-hidden="true" />}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <span className="hidden items-center gap-5 sm:inline-flex">
            <AuthControls className="text-[0.68rem] font-light uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white" />
          </span>

          <Link
            href="/carrito"
            data-cart-fly-target
            className="relative grid h-9 w-9 place-items-center rounded-full text-white/85 transition-colors hover:text-white"
            aria-label={`Carrito (${count})`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 14 }}
                className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ember-500 px-1 text-[0.6rem] font-medium text-white"
              >
                {count}
              </motion.span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:text-white md:hidden"
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop — dims the page so the menu reads against any hero */}
            <motion.button
              type="button"
              aria-label="Cerrar menú"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-3 right-3 top-[4.6rem] z-50 overflow-hidden rounded-2xl border border-white/10 bg-ink-950/95 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:hidden"
            >
              <nav aria-label="Menú móvil" className="flex flex-col py-2">
                {LINKS.map((l, i) => {
                  const isActive = pathname === l.to;
                  return (
                    <motion.div
                      key={l.to}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.05, duration: 0.25, ease: "easeOut" }}
                    >
                      <Link
                        href={l.to}
                        onClick={() => setMenuOpen(false)}
                        className={`block w-full py-4 text-center text-[0.82rem] uppercase tracking-[0.25em] transition-colors ${
                          isActive ? "text-gold-300" : "text-white/85 hover:text-white"
                        }`}
                        style={{ fontFamily: "var(--font-ritual)" }}
                      >
                        {l.label}
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + LINKS.length * 0.05, duration: 0.25, ease: "easeOut" }}
                  className="mx-6 my-2 border-t border-white/[0.08]"
                />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.09 + LINKS.length * 0.05, duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col items-center pb-3 text-center [&>a]:w-full"
                >
                  {/* onNavigate closes the menu from the LINKS only — a wrapper
                      onClick here would also fire from the UserButton and unmount
                      its popover before "Cerrar sesión" can be tapped. */}
                  <AuthControls
                    onNavigate={() => setMenuOpen(false)}
                    className="block w-full py-4 text-center text-[0.82rem] uppercase tracking-[0.25em] text-white/85 transition-colors hover:text-white"
                  />
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
