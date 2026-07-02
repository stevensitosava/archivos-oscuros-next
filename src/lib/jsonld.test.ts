import { describe, it, expect } from "vitest";
import { safeJsonLd } from "./jsonld";

describe("safeJsonLd", () => {
  it("escapes a </script> breakout in a string value", () => {
    const out = safeJsonLd({ name: "Marco</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("\\u003c");
  });

  it("escapes angle brackets and ampersands", () => {
    const out = safeJsonLd({ t: "a < b & c > d" });
    expect(out).not.toMatch(/[<>&]/);
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u0026");
    expect(out).toContain("\\u003e");
  });

  it("still parses back to the original object (valid JSON)", () => {
    const obj = { name: "El Código </script>", n: 5 };
    expect(JSON.parse(safeJsonLd(obj))).toEqual(obj);
  });
});
