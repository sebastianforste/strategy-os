import { test, expect, type Page } from "@playwright/test";
import { gotoHome } from "./helpers";

async function openToolsPanel(page: Page) {
  await page.getByRole("button", { name: "Open tools panel" }).click();
  await expect(page.getByRole("dialog", { name: "Tools" })).toBeVisible();
}

async function runToolAction(page: Page, label: string) {
  await openToolsPanel(page);
  await page.getByRole("button", { name: label, exact: true }).click();
}

test.describe("Tools action matrix", () => {
  test("mobile tools actions launch their target surfaces", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page, { seedDemoKeys: true });

    await runToolAction(page, "Daily Briefing");
    await expect(page.getByRole("heading", { name: "Briefing" })).toBeVisible();
    await page.getByRole("button", { name: "Close daily briefing" }).click();

    await runToolAction(page, "Settings");
    await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
    await page.getByLabel("Close Settings").first().click({ force: true });

    await runToolAction(page, "History");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await page.getByRole("button", { name: "Close History" }).click();

    await runToolAction(page, "Voice Training");
    await expect(page.getByRole("heading", { name: "Brand Voice Training" })).toBeVisible();
    await page.keyboard.press("Escape");

    await runToolAction(page, "Ghost Agent");
    await expect(page.getByRole("heading", { name: "Ghost Agent" })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click({ force: true });

    await runToolAction(page, "Analytics");
    await expect(page.getByRole("heading", { name: "StrategyOS Analytics" })).toBeVisible();
    await page.getByRole("button", { name: "Close Analytics" }).click();

    await runToolAction(page, "Manifesto");
    await expect(page.getByRole("button", { name: "Close Manifesto" })).toBeVisible();
    await page.getByRole("button", { name: "Close Manifesto" }).click();
    await expect(page.getByRole("button", { name: "Close Manifesto" })).toHaveCount(0);

    await runToolAction(page, "Design DNA");
    await expect(page.getByText("Stitch DNA")).toBeVisible();
  });
});
