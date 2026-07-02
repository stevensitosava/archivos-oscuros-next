"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ============================================================
   Cookie consent (GDPR/LSSI). Shows once until a choice is made,
   persisted in localStorage. Strictly-necessary cookies (auth,
   security, cart) are always on; analytics/marketing are off by
   default and opt-in. No tracking scripts are wired yet — this is
   the consent gate, ready for when/if any are added. Read the
   stored choice elsewhere with getCookieConsent().
   ============================================================ */

const STORAGE_KEY = "ao-cookie-consent";
const VERSION = 1;

export interface Consent {
  v: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

export function getCookieConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return c && c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false); // banner visible
  const [showPrefs, setShowPrefs] = useState(false); // expanded panel
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Decide on mount (after hydration) whether the banner is needed.
  useEffect(() => {
    setMounted(true);
    const existing = getCookieConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    } else {
      setOpen(true);
    }
  }, []);

  // Allow re-opening preferences from anywhere (footer / cookies page).
  useEffect(() => {
    const handler = () => {
      const existing = getCookieConsent();
      setAnalytics(existing?.analytics ?? false);
      setMarketing(existing?.marketing ?? false);
      setShowPrefs(true);
      setOpen(true);
    };
    window.addEventListener("ao:cookie-prefs", handler);
    return () => window.removeEventListener("ao:cookie-prefs", handler);
  }, []);

  function persist(c: Omit<Consent, "v" | "necessary" | "ts">) {
    const value: Consent = { v: VERSION, necessary: true, ts: Date.now(), ...c };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* storage blocked — banner simply reappears next visit */
    }
    setOpen(false);
    setShowPrefs(false);
  }

  if (!mounted || !open) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md"
    >
      <div className="mobile-menu-glass rounded-xl p-5 shadow-tome">
        <p className="eyebrow mb-2">Cookies</p>
        <p className="text-[0.92rem] leading-relaxed text-ash-400">
          Usamos cookies estrictamente necesarias para que el sitio funcione (inicio de sesión,
          seguridad y carrito). Las cookies opcionales solo se activan con tu permiso.{" "}
          <Link href="/cookies" className="text-bone-200 underline underline-offset-2 hover:text-gold-300">
            Más información
          </Link>
          .
        </p>

        {showPrefs && (
          <div className="mt-4 space-y-3 border-t border-bone-100/10 pt-4">
            <PrefRow label="Necesarias" desc="Imprescindibles. Siempre activas." checked disabled />
            <PrefRow
              label="Analíticas"
              desc="Nos ayudan a entender el uso del sitio."
              checked={analytics}
              onChange={setAnalytics}
            />
            <PrefRow
              label="Marketing"
              desc="Personalización y comunicaciones."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button className="btn btn-ember !px-5 !py-2.5 !text-[0.7rem]" onClick={() => persist({ analytics: true, marketing: true })}>
            Aceptar todas
          </button>
          <button className="btn btn-ghost !px-5 !py-2.5 !text-[0.7rem]" onClick={() => persist({ analytics: false, marketing: false })}>
            Solo necesarias
          </button>
          {showPrefs ? (
            <button className="btn btn-ghost !px-5 !py-2.5 !text-[0.7rem]" onClick={() => persist({ analytics, marketing })}>
              Guardar selección
            </button>
          ) : (
            <button
              className="text-[0.72rem] uppercase tracking-[0.2em] text-ash-400 transition-colors hover:text-bone-100"
              onClick={() => setShowPrefs(true)}
            >
              Configurar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PrefRow({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? "opacity-70" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-bone-100"
      />
      <span>
        <span className="block text-[0.86rem] font-medium text-bone-100">{label}</span>
        <span className="block text-[0.78rem] text-ash-500">{desc}</span>
      </span>
    </label>
  );
}
