import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-834", width: 834, height: 1112 },
  { name: "laptop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

test.describe("Responsive layout regression", () => {
  for (const viewport of VIEWPORTS) {
    test(`no shell overlap at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoHome(page, { seedDemoKeys: true });
      const visibleOmniInput = page.locator('input[aria-label="Omni command input"]:visible').first();
      await expect(visibleOmniInput).toBeVisible();
      await page.waitForTimeout(200);

      const audit = await page.evaluate(() => {
        const intersects = (a: DOMRect, b: DOMRect) => {
          const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          return x * y > 0;
        };

        const brand = document.querySelector('a[href="/"]')?.getBoundingClientRect();
        const topButtons = Array.from(document.querySelectorAll("header button")).map((b) => b.getBoundingClientRect());
        const commandInput = Array.from(document.querySelectorAll<HTMLInputElement>('input[aria-label="Omni command input"]'))
          .find((input) => {
            const style = window.getComputedStyle(input);
            return style.display !== "none" && style.visibility !== "hidden" && input.getClientRects().length > 0;
          })
          ?.getBoundingClientRect();

        const overlapWithBrand = !!brand && topButtons.some((r) => intersects(brand, r));
        const shellOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
        const tolerancePx = 4;
        const commandOutOfBounds = !!commandInput && (commandInput.left < -tolerancePx || commandInput.right > window.innerWidth + tolerancePx);

        return {
          overlapWithBrand,
          shellOverflow,
          commandOutOfBounds,
        };
      });

      expect(audit.overlapWithBrand).toBe(false);
      expect(audit.shellOverflow).toBe(false);
      expect(audit.commandOutOfBounds).toBe(false);
    });
  }
});
