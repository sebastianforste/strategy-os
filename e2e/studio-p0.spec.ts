import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("Studio P0 Flows", () => {
  test("shows onboarding and allows key save", async ({ page }) => {
    await gotoHome(page);

    await expect(page.getByText("Setup required to generate drafts")).toBeVisible();
    await page.getByLabel("Gemini API key").fill("demo");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Gemini key saved.")).toBeVisible();
    await expect(page.getByText("Setup required to generate drafts")).not.toBeVisible();
  });

  test("can polish editor content", async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });

    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type(
      "We should leverage this trend.\n\nThis is a game-changer for growth."
    );

    await page.getByRole("button", { name: "Polish" }).first().click();
    await expect(page.getByText("Polish Ready")).toBeVisible();
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("Polish Ready")).not.toBeVisible();
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
