import { describe, it, expect } from "vitest";
import { formatMoney, isLocal, EUR_LOCALE } from "./money";

const norm = (s: string) => s.replace(/ /g, " ");

describe("formatMoney", () => {
  it("EUR base renders the standard euro format", () => {
    expect(norm(formatMoney(499, EUR_LOCALE))).toBe("4,99 €");
  });

  it("converts to local currency and suffixes the ISO code", () => {
    const out = formatMoney(499, { currency: "MXN", rate: 20 }); // ~99.80 MXN
    expect(out).toContain("MXN");
    expect(out).toMatch(/\$/);
  });

  it("drops decimals for large local amounts", () => {
    const out = formatMoney(499, { currency: "COP", rate: 4300 }); // ~21457 COP
    expect(out).toContain("COP");
    expect(out).not.toMatch(/,\d{2}\s?COP/); // no cents on big amounts
  });

  it("unknown currency falls back to EUR", () => {
    expect(norm(formatMoney(499, { currency: "XX", rate: 5 }))).toBe("4,99 €");
  });

  it("isLocal is true only for a non-EUR currency with a positive rate", () => {
    expect(isLocal(EUR_LOCALE)).toBe(false);
    expect(isLocal({ currency: "USD", rate: 0 })).toBe(false);
    expect(isLocal({ currency: "USD", rate: 1.08 })).toBe(true);
  });
});
