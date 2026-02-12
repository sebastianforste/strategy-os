import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("Shell panel interactions", () => {
  test("mobile tools panel opens and runs actions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page, { seedDemoKeys: true });

    await page.getByRole("button", { name: "Open tools panel" }).click();
    await expect(page.getByRole("dialog", { name: "Tools" })).toBeVisible();

    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
    await page.getByLabel("Close Settings").first().click({ force: true });
  });

  test("tablet left/right rail toggles render drawers", async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoHome(page, { seedDemoKeys: true });

    await page.getByRole("button", { name: "Toggle personas panel" }).click();
    await expect(page.getByRole("heading", { name: "Personas" })).toBeVisible();

    await page.getByRole("button", { name: "Close panel" }).click();
    await page.getByRole("button", { name: "Toggle telemetry panel" }).click();
    await expect(page.getByRole("heading", { name: "Runtime Telemetry" })).toBeVisible();
  });
});
