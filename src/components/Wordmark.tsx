"use client";

import Link from "next/link";

interface WordmarkProps {
  className?: string;
  /** Stacked two-line lockup (footer) vs single line (nav). */
  stacked?: boolean;
}

/** "AO" monogram emblem — an A inscribed in a ring. */
function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" />
      <path d="M16 9 L21 22 M16 9 L11 22 M12.7 18 L19.3 18" />
    </svg>
  );
}

/** Refined compact wordmark — AO emblem + two-tone "ARCHIVOS OSCUROS". */
export default function Wordmark({ className = "", stacked }: WordmarkProps) {
  return (
    <Link
      href="/"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Archivos Oscuros — inicio"
    >
      <Emblem className="h-7 w-7 shrink-0 text-bone-100 transition-colors duration-300 group-hover:text-bone-50" />
      <span
        className={`leading-none ${stacked ? "flex flex-col gap-1" : "flex items-baseline gap-1.5"}`}
        style={{ fontFamily: "var(--font-ritual)" }}
      >
        <span className="text-[0.8rem] font-semibold tracking-[0.1em] text-bone-50">ARCHIVOS</span>
        <span className="text-[0.8rem] font-light tracking-[0.1em] text-bone-300 transition-colors duration-300 group-hover:text-bone-100">
          OSCUROS
        </span>
      </span>
    </Link>
  );
}
