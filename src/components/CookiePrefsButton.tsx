"use client";

/** Reopens the cookie-preferences panel from anywhere (cookies page, footer). */
export default function CookiePrefsButton({
  className = "btn btn-ghost",
  children = "Configurar cookies",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("ao:cookie-prefs"))}
    >
      {children}
    </button>
  );
}
