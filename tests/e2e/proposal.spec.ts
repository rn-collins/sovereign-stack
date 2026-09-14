import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const canonicalRoutes = [
  "/",
  "/proposal",
  "/demo",
  "/system",
  "/engagement",
  "/evidence",
  "/tools/decision-gate",
  "/tools/authority-record",
  "/definitions",
] as const;

test.describe("canonical proposal routes", () => {
  for (const route of canonicalRoutes) {
    test(`${route} is directly addressable`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.status(), `${route} should not be a fallback 404`).toBe(200);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("body")).not.toContainText("This page could not be found");
    });
  }
});

test("executive entry point has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("executive navigation updates a shareable URL and respects browser history", async ({ page }) => {
  await page.goto("/proposal");

  await page.getByRole("button", { name: "Test one fictional use" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("heading", { name: "Watch one proposed use move from definition to decision—and, if authorized, through change and exit." })).toBeVisible();
  await expect(page.getByText("Why I am resurfacing this")).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/proposal$/);
  await expect(page.getByRole("heading", { name: /Authority Layer models how a use could remain tied/ })).toBeVisible();
});

test("evidence sources are complete, external, and safely opened", async ({ page }) => {
  await page.goto("/evidence");
  const sourceLinks = page.locator('main a[target="_blank"]');

  expect(await sourceLinks.count()).toBeGreaterThanOrEqual(6);
  await expect(page.getByText("Accessed 13 September 2026")).toHaveCount(6);

  for (const link of await sourceLinks.all()) {
    const href = await link.getAttribute("href");
    const rel = (await link.getAttribute("rel"))?.split(/\s+/) ?? [];

    expect(href).toBeTruthy();
    const url = new URL(href!);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).not.toBe("sovereign-stack-psi.vercel.app");
    expect(rel).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }
});

test("Decision Gate exposes its bounded review outcomes", async ({ page }) => {
  await page.goto("/tools/decision-gate");

  for (let question = 0; question < 7; question += 1) {
    await page.locator(".question-panel fieldset label").first().click();
  }
  await expect(page.getByRole("status")).toContainText("Eligible for authority review");

  await page.getByRole("button", { name: "Clear demonstration" }).click();
  await page.locator(".question-panel fieldset label").last().click();
  for (let question = 1; question < 7; question += 1) {
    await page.locator(".question-panel fieldset label").first().click();
  }
  await expect(page.getByRole("status")).toContainText("Do not proceed");
});
