import { describe, it, expect } from "vitest";
import { bundleFor, paidTotal, nextBundleHint, offerLabel, BUNDLE_TIERS } from "./bundles";

const book = (priceCents = 499) => ({ priceCents });

describe("bundleFor", () => {
  it("returns null below the lowest tier", () => {
    expect(bundleFor(0)).toBeNull();
    expect(bundleFor(1)).toBeNull();
    expect(bundleFor(2)).toBeNull();
  });
  it("applies the 3-book pack at 3 (and 4)", () => {
    expect(bundleFor(3)?.priceCents).toBe(999);
    expect(bundleFor(4)?.priceCents).toBe(999);
  });
  it("applies the full collection at 5+", () => {
    expect(bundleFor(5)?.priceCents).toBe(1499);
    expect(bundleFor(6)?.priceCents).toBe(1499);
  });
});

describe("paidTotal", () => {
  it("sums individually with no qualifying bundle", () => {
    const r = paidTotal([book(), book()]);
    expect(r.bundle).toBeNull();
    expect(r.total).toBe(998);
    expect(r.fullPrice).toBe(998);
    expect(r.savings).toBe(0);
  });
  it("charges the 3-pack price and reports savings", () => {
    const r = paidTotal([book(), book(), book()]);
    expect(r.bundle?.priceCents).toBe(999);
    expect(r.fullPrice).toBe(1497);
    expect(r.total).toBe(999);
    expect(r.savings).toBe(498);
  });
  it("charges the full-collection price at 5", () => {
    const r = paidTotal(Array.from({ length: 5 }, () => book()));
    expect(r.total).toBe(1499);
    expect(r.fullPrice).toBe(2495);
    expect(r.savings).toBe(996);
  });
  it("4 books = 3-pack + 1 at full price (no free 4th book)", () => {
    const r = paidTotal(Array.from({ length: 4 }, () => book()));
    expect(r.total).toBe(999 + 499); // pack of 3 + the extra book
    expect(r.fullPrice).toBe(1996);
    expect(r.savings).toBe(498);
  });
  it("6 books = collection + 1 extra", () => {
    const r = paidTotal(Array.from({ length: 6 }, () => book()));
    expect(r.total).toBe(1499 + 499);
  });
  it("never charges more than buying separately", () => {
    // A single cheap book must not be pushed up to a bundle price.
    expect(paidTotal([book(100)]).total).toBe(100);
    // Three very cheap books: full price beats the tier — no bundle claimed.
    const cheap = paidTotal([book(100), book(100), book(100)]);
    expect(cheap.total).toBe(300);
    expect(cheap.bundle).toBeNull();
    expect(cheap.savings).toBe(0);
  });
});

describe("offerLabel", () => {
  it("uses the tier label at exact count", () => {
    expect(offerLabel(3, bundleFor(3))).toBe("Pack de 3");
    expect(offerLabel(5, bundleFor(5))).toBe("Pack de 5");
  });
  it("uses a generic label between tiers", () => {
    expect(offerLabel(4, bundleFor(4))).toBe("Oferta combinada");
  });
  it("is empty with no bundle", () => {
    expect(offerLabel(2, bundleFor(2))).toBe("");
  });
});

describe("nextBundleHint", () => {
  it("points 1-book carts at the 3-pack", () => {
    const h = nextBundleHint(1);
    expect(h?.tier.minBooks).toBe(3);
    expect(h?.needed).toBe(2);
  });
  it("points 3-book carts at the full collection", () => {
    const h = nextBundleHint(3);
    expect(h?.tier.minBooks).toBe(5);
    expect(h?.needed).toBe(2);
  });
  it("returns null once the top tier is reached", () => {
    expect(nextBundleHint(5)).toBeNull();
  });
});

describe("BUNDLE_TIERS shape", () => {
  it("is ordered high-to-low so bundleFor picks the best", () => {
    for (let i = 1; i < BUNDLE_TIERS.length; i++) {
      expect(BUNDLE_TIERS[i - 1].minBooks).toBeGreaterThan(BUNDLE_TIERS[i].minBooks);
    }
  });
});
