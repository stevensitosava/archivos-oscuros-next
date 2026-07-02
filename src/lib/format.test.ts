import { describe, it, expect } from "vitest";
import { formatPrice, formatDate } from "./format";

// es-ES separates the amount and € with a (narrow) non-breaking space; normalize it.
const norm = (s: string) => s.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formats cents as EUR in Spanish locale", () => {
    expect(norm(formatPrice(1299))).toBe("12,99 €");
    expect(norm(formatPrice(0))).toBe("0,00 €");
    expect(norm(formatPrice(1149))).toBe("11,49 €");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as a Spanish long date", () => {
    const out = formatDate("2026-06-30T12:00:00.000Z");
    expect(out).toMatch(/2026/);
    expect(out.toLowerCase()).toMatch(/jun/);
  });
});
