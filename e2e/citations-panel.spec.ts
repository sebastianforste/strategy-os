import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("Citations Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/generate*", async (route) => {
      const body = [
        "This is a generated post with citations.",
        "",
        '<!-- STRATEGYOS_META {"citations":[',
        '{"id":"c1","source":"web","title":"Example Source","url":"https://example.com","chunkIndex":0},',
        '{"id":"c2","source":"knowledge","title":"Internal Knowledge","chunkIndex":2}',
        ']} -->',
      ].join("\n");

      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body,
      });
    });

    await gotoHome(page, { seedDemoKeys: true });
  });

  test("shows Sources Used when generation includes STRATEGYOS_META citations", async ({ page }) => {
    await page.getByPlaceholder(/What strategy do you want to build today/i).fill("Test prompt");
    await page.getByRole("button", { name: "Initiate sequence" }).click();

    await expect(page.getByText("Sources Used")).toBeVisible();
    await expect(page.getByRole("link", { name: "Example Source" })).toBeVisible();
  });
});
