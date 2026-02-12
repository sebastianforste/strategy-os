import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("Studio P0 Flows", () => {
  test("shows onboarding and allows key save", async ({ page }) => {
    await gotoHome(page);

    const setupBanner = page.getByText("Setup required to generate drafts").first();
    await expect(setupBanner).toBeVisible();
    await page.locator('input[aria-label="Gemini API key"]:visible').first().fill("demo");
    await page.locator('button:has-text("Save"):visible').first().click();

    await expect(page.getByText("Gemini key saved.")).toBeVisible();
    await expect(setupBanner).not.toBeVisible();
  });

  test("can polish editor content", async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });

    await page.getByRole("button", { name: "Polish" }).first().click();
    const polishReady = page.getByText("Polish Ready");
    const noChangesToast = page.getByText("No polish changes needed.");

    try {
      await polishReady.waitFor({ state: "visible", timeout: 2500 });
      await page.getByRole("button", { name: "Apply" }).click();
      await expect(polishReady).not.toBeVisible();
    } catch {
      await expect(noChangesToast).toBeVisible();
    }
  });

  test("can publish from editor header", async ({ page }) => {
    await page.route("**/api/distribute", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          platform: "linkedin",
          url: "https://example.com/post/123",
          message: "Published from test.",
        }),
      });
    });

    await gotoHome(page, { seedDemoKeys: true });
    await page.locator("header").getByRole("button", { name: "Publish" }).first().click();
    await expect(page.getByText("Published from test.")).toBeVisible();
  });
});
