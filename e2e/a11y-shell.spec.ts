import { test, expect } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("Shell accessibility and reliability", () => {
  test("all visible buttons have an accessible name", async ({ page }) => {
    await gotoHome(page, { seedDemoKeys: true });

    const result = await page.evaluate(() => {
      const missing: string[] = [];
      const buttons = Array.from(document.querySelectorAll("button"));

      for (const button of buttons) {
        const style = window.getComputedStyle(button);
        if (style.display === "none" || style.visibility === "hidden") continue;

        const text = (button.textContent || "").trim();
        const aria = (button.getAttribute("aria-label") || "").trim();
        const title = (button.getAttribute("title") || "").trim();
        if (!text && !aria && !title) {
          missing.push(button.outerHTML.slice(0, 120));
        }
      }

      return { missing };
    });

    expect(result.missing).toEqual([]);
  });

  test("supports keyboard navigation and reduced motion policy", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoHome(page, { seedDemoKeys: true });

    const omniInput = page.getByLabel("Omni command input");
    await omniInput.focus();
    await page.keyboard.press("Tab");
    const focusedAfterTab = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return "";
      return (
        active.getAttribute("aria-label") ||
        active.getAttribute("title") ||
        active.textContent ||
        active.tagName
      );
    });
    expect(focusedAfterTab.trim().length).toBeGreaterThan(0);

    const animationName = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.className = "animate-spin-slow";
      document.body.appendChild(probe);
      const computed = window.getComputedStyle(probe).animationName;
      probe.remove();
      return computed;
    });

    expect(animationName === "none" || animationName === "").toBe(true);
  });

  test("dev runtime has no service-worker registration failure and icons are valid", async ({ page }) => {
    const logs: Array<{ type: string; text: string }> = [];
    page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));

    await gotoHome(page, { seedDemoKeys: true });

    await expect(page.getByRole("link", { name: /strategyos/i })).toBeVisible();

    const iconSizes = await page.evaluate(async () => {
      const getSize = async (url: string) => {
        const response = await fetch(url);
        const data = await response.arrayBuffer();
        return data.byteLength;
      };

      return {
        icon192: await getSize("/icons/icon-192x192.png"),
        icon512: await getSize("/icons/icon-512x512.png"),
      };
    });

    expect(iconSizes.icon192).toBeGreaterThan(0);
    expect(iconSizes.icon512).toBeGreaterThan(0);

    const hasServiceWorkerFailure = logs.some((line) => line.text.toLowerCase().includes("serviceworker registration failed"));
    const hasHydrationError = logs.some(
      (line) =>
        line.type === "error" &&
        (line.text.includes("Hydration failed") || line.text.includes("didn't match the client"))
    );

    expect(hasServiceWorkerFailure).toBe(false);
    expect(hasHydrationError).toBe(false);
  });
});
