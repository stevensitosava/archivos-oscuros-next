import { test, expect } from "@playwright/test";

/** Mobile smoke for the conversion-funnel UI — 360px, the overflow-prone width. */
test.use({ viewport: { width: 360, height: 740 } });

const noHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
};

test("mobile home: hero CTAs + newsletter capture, no overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Libro gratis" }).first()).toBeVisible();
  await expect(page.getByText("Sin tarjeta · Tuyo en 1 minuto")).toBeVisible();
  await noHorizontalOverflow(page);
});

test("mobile gratis: 3-step panel, no overflow", async ({ page }) => {
  await page.goto("/gratis");
  await expect(page.getByText("1 · Crea tu cuenta gratis")).toBeVisible();
  await noHorizontalOverflow(page);
});

test("mobile libro: sample modal opens and pages fit", async ({ page }) => {
  await page.goto("/libro/la-mente-del-samurai");
  await page.getByRole("dialog", { name: /cookies/i }).getByRole("button", { name: /aceptar todas/i }).click();
  await page.getByRole("button", { name: /primeras páginas/i }).click();
  const dialog = page.getByRole("dialog", { name: /vista previa/i });
  await expect(dialog).toBeVisible();
  const img = dialog.locator("img[alt^='Página']");
  await expect(img).toBeVisible();
  const box = await img.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(360);
  await noHorizontalOverflow(page);
});
