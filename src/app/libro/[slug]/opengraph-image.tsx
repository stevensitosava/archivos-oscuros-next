import { ImageResponse } from "next/og";
import { getBookBySlug } from "@/lib/books-data";
import { CATEGORIES } from "@/types";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Archivos Oscuros";

/** Per-book social card — on-brand (near-black + ember), generated at build. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  const title = book?.title ?? "Archivos Oscuros";
  const author = book?.author ?? "Archivos Oscuros";
  const category = CATEGORIES.find((c) => c.slug === book?.category)?.label ?? "Ebooks";
  const price = book ? (book.priceCents > 0 ? `${(book.priceCents / 100).toFixed(2)} €` : "Gratis") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#010101",
          color: "#f4f4f5",
          padding: "70px 80px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: "#b2342a" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#e3766c", fontSize: 26, letterSpacing: 8 }}>
          <div style={{ width: 44, height: 3, background: "#b2342a" }} />
          <span>{category.toUpperCase()}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, color: "#ffffff", maxWidth: 940 }}>
            {title}
          </div>
          <div style={{ fontSize: 34, color: "#9a9a9f", marginTop: 22 }}>{author}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: "2px solid #f4f4f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              A
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 26, fontWeight: 700, letterSpacing: 2 }}>
              <span>ARCHIVOS</span>
              <span style={{ color: "#9a9a9f", fontWeight: 400 }}>OSCUROS</span>
            </div>
          </div>
          {price ? (
            <div style={{ fontSize: 34, fontWeight: 700, color: price === "Gratis" ? "#5fb98f" : "#f4f4f5" }}>{price}</div>
          ) : (
            <div />
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
