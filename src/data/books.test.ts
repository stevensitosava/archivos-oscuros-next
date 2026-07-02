import { describe, it, expect } from "vitest";
import type { Book } from "../types";
import {
  findById,
  findBySlug,
  freeBooks,
  featuredBooks,
  byCategory,
  relatedTo,
  searchBooks,
  sortBooks,
} from "./books";

function book(overrides: Partial<Book>): Book {
  return {
    id: "id",
    slug: "slug",
    title: "Title",
    author: "Archivos Oscuros",
    category: "historia",
    tagline: "",
    synopsis: "",
    priceCents: 1000,
    currency: "EUR",
    formats: ["PDF"],
    pages: 100,
    year: 2024,
    language: "Español",
    tags: [],
    code: "AO-000",
    cover: { bg: "#171717", ink: "#ececee", motif: "skull" },
    rating: 4,
    ...overrides,
  };
}

const catalog: Book[] = [
  book({ id: "a", slug: "espartana", title: "Sangre Espartana", category: "historia", priceCents: 1149, rating: 4.6, year: 2023, featured: true, tags: ["esparta"] }),
  book({ id: "b", slug: "gratis", title: "El Estoico", category: "estoicismo", priceCents: 0, rating: 4.7, year: 2024, tags: ["seneca"] }),
  book({ id: "c", slug: "vikinga", title: "La Filosofía Vikinga", category: "filosofia", priceCents: 1099, rating: 4.5, year: 2025, tags: ["coraje"] }),
  book({ id: "d", slug: "samurai", title: "La Mente del Samurái", category: "guerreros", priceCents: 1299, rating: 4.8, year: 2025 }),
];

describe("lookups", () => {
  it("finds by id and slug", () => {
    expect(findById(catalog, "c")?.title).toBe("La Filosofía Vikinga");
    expect(findBySlug(catalog, "samurai")?.id).toBe("d");
    expect(findById(catalog, "nope")).toBeUndefined();
  });
});

describe("freeBooks", () => {
  it("returns only zero-priced titles", () => {
    const free = freeBooks(catalog);
    expect(free).toHaveLength(1);
    expect(free[0].id).toBe("b");
  });
});

describe("featuredBooks", () => {
  it("prefers flagged, else falls back to first 6", () => {
    expect(featuredBooks(catalog).map((b) => b.id)).toEqual(["a"]);
    const none = catalog.map((b) => ({ ...b, featured: false }));
    expect(featuredBooks(none)).toHaveLength(4);
  });
});

describe("byCategory", () => {
  it("filters by category", () => {
    expect(byCategory(catalog, "guerreros").map((b) => b.id)).toEqual(["d"]);
  });
});

describe("relatedTo", () => {
  it("same category, excludes self", () => {
    const espartana = catalog[0];
    const extra = book({ id: "e", slug: "roma", category: "historia" });
    const related = relatedTo([...catalog, extra], espartana);
    expect(related.map((b) => b.id)).toEqual(["e"]);
    expect(related.some((b) => b.id === espartana.id)).toBe(false);
  });
});

describe("searchBooks", () => {
  it("matches title, and tags, case-insensitively", () => {
    expect(searchBooks(catalog, "samurái").map((b) => b.id)).toEqual(["d"]);
    expect(searchBooks(catalog, "ESPARTA").map((b) => b.id)).toEqual(["a"]);
    expect(searchBooks(catalog, "")).toHaveLength(catalog.length);
    expect(searchBooks(catalog, "zzz")).toHaveLength(0);
  });
});

describe("sortBooks", () => {
  it("sorts by price asc/desc", () => {
    expect(sortBooks(catalog, "precio-asc").map((b) => b.priceCents)).toEqual([0, 1099, 1149, 1299]);
    expect(sortBooks(catalog, "precio-desc").map((b) => b.priceCents)).toEqual([1299, 1149, 1099, 0]);
  });
  it("sorts by rating and year", () => {
    expect(sortBooks(catalog, "valoracion")[0].id).toBe("d"); // 4.8
    expect(sortBooks(catalog, "recientes")[0].year).toBe(2025);
  });
  it("does not mutate the input", () => {
    const before = catalog.map((b) => b.id);
    sortBooks(catalog, "precio-asc");
    expect(catalog.map((b) => b.id)).toEqual(before);
  });
});
