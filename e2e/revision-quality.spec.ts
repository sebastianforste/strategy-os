import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

async function setEditorContent(page: import("@playwright/test").Page, text: string) {
  const editor = page.locator('main [contenteditable="true"]').first();
  await expect(editor).toBeVisible();
  await editor.fill(text, { force: true });
  await expect(page.getByText(text.split("\n")[0], { exact: false }).first()).toBeVisible();
}

async function openRevisionStudio(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /^Revise$/i }).click();
  await expect(page.getByRole("dialog", { name: "Revision Studio" })).toBeVisible({ timeout: 10000 });
}

async function ensureGenerationReady(page: import("@playwright/test").Page) {
  const setupBanner = page.getByText("Setup required to generate drafts").first();
  await expect(setupBanner).toBeVisible();
  await page.locator('input[aria-label="Gemini API key"]:visible').first().fill("demo");
  await page.locator('button:has-text("Save"):visible').first().click();
  await expect(page.getByText("Gemini key saved.")).toBeVisible();
  await expect(setupBanner).not.toBeVisible();
}

test.describe("Revision Studio quality gate", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
    await ensureGenerationReady(page);
  });

  test("blocks apply when revision quality fails", async ({ page }) => {
    const lowQualityText =
      "This strategy narrative runs forever without sentence breaks and keeps stacking clauses to create one overly dense paragraph that degrades readability and makes executive scanning nearly impossible while preserving no clear cadence and no separation of ideas in a way that forces cognitive overload for readers evaluating the argument in a high-pressure environment";

    await setEditorContent(page, lowQualityText);
    await openRevisionStudio(page);

    await expect(page.getByText("Blocked")).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply selected revision" })).toBeDisabled();
  });

  test("enables apply when revision quality passes", async ({ page }) => {
    const highQualityText = `AI is forcing legal teams to redesign operating models.

The firms winning in 2026 are pricing outcomes, not hours.

Start with one workflow, set one metric, and publish results every 30 days.

That loop builds trust, margin, and distribution at the same time.`;

    await setEditorContent(page, highQualityText);
    await openRevisionStudio(page);

    await expect(page.getByText("Pass")).toBeVisible();
    const applyButton = page.getByRole("button", { name: "Apply selected revision" });
    await expect(applyButton).toBeEnabled();
    await applyButton.click();

    await expect(page.getByText(/Revision applied with .* voice\./)).toBeVisible();
  });
});
