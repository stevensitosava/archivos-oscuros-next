"use client";

import { useEffect } from "react";

/** Catches errors in the root layout itself (renders its own <html>/<body>). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#010101",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 600 }}>Archivos Oscuros</h1>
          <p style={{ color: "#9a9a9f", marginTop: "0.75rem" }}>
            Ha ocurrido un error. Recarga la página o inténtalo de nuevo.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.7rem 1.5rem",
              borderRadius: 9999,
              border: "none",
              background: "#ffffff",
              color: "#010101",
              cursor: "pointer",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
