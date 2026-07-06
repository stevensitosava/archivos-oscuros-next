import { test, expect } from "@playwright/test";

/**
 * Storefront E2E — the critical browse → cart journey, no auth required.
 * Deterministic against the seeded 9-book catalog (same in demo + real mode).
 */

test("homepage renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Archivos Oscuros/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/ARCHIVOS/i);
});

test("catalog lists books and search filters them", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.locator("article")).toHaveCount(9);

  await page.getByPlaceholder(/buscar/i).fill("samurái");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article")).toContainText(/samurái/i);
});

test("category filter narrows the catalog", async ({ page }) => {
  await page.goto("/catalogo");
  await page.getByRole("button", { name: "Guerreros" }).click();
  await expect(page.locator("article")).toHaveCount(4); // Código del Guerrero, Mente del Samurái, Código Templario, Vía de la Sombra
  await expect(page.getByRole("article").first()).toContainText(/Guerrero|Samurái/i);
});

test("book detail page shows title, price and synopsis", async ({ page }) => {
  // ao-005 is a PAID title (4,99 €); ao-001 is now the free lead magnet.
  await page.goto("/libro/la-mente-del-samurai");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("La Mente del Samurái");
  await expect(page.getByText("Sinopsis")).toBeVisible();
  await expect(page.getByText(/4,99/).first()).toBeVisible();
});

test("free book detail page shows Gratis", async ({ page }) => {
  await page.goto("/libro/el-codigo-del-guerrero");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("El Código del Guerrero");
  await expect(page.getByText("Gratis").first()).toBeVisible();
});

test("adding a book to the cart shows it in /carrito", async ({ page }) => {
  await page.goto("/libro/el-codigo-del-guerrero");
  // The primary detail-page button (exact name); related-book cards say "Añadir al carrito".
  await page.getByRole("button", { name: "Añadir", exact: true }).click();
  await page.goto("/carrito");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/carrito/i);
  await expect(page.getByText("El Código del Guerrero")).toBeVisible();
});

test("cookie consent can be accepted and dismisses", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("dialog", { name: /cookies/i });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: /aceptar todas/i }).click();
  await expect(banner).toBeHidden();
});

test("legal privacy page loads", async ({ page }) => {
  await page.goto("/privacidad");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/privacidad/i);
});

test("gratis page shows the free title", async ({ page }) => {
  await page.goto("/gratis");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.locator("article")).toContainText("El Código del Guerrero");
});
