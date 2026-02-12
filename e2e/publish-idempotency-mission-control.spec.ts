import { test, expect } from "@playwright/test";

test.describe("Publish Idempotency (Mission Control)", () => {
  test("retry publish does not create duplicate publish_completed events", async ({ page }) => {
    // Clean slate to make assertions stable.
    const reset = await page.request.post("/api/e2e/reset");
    expect(reset.ok()).toBeTruthy();

    const content = `E2E publish idempotency ${Date.now()}`;
    const first = await page.request.post("/api/distribute", {
      data: {
        platform: "linkedin",
        content,
        title: "E2E Publish",
        persona: "cso",
      },
    });
    expect(first.ok()).toBeTruthy();
    const firstJson = (await first.json()) as any;
    expect(firstJson.success).toBeTruthy();
    expect(typeof firstJson.strategyId).toBe("string");

    const second = await page.request.post("/api/distribute", {
      data: {
        platform: "linkedin",
        content,
        title: "E2E Publish",
        persona: "cso",
        strategyId: firstJson.strategyId,
        idempotencyKey: `e2e:${firstJson.strategyId}:LINKEDIN`,
      },
    });
    expect(second.ok()).toBeTruthy();
    const secondJson = (await second.json()) as any;
    expect(secondJson.success).toBeTruthy();
    expect(secondJson.strategyId).toBe(firstJson.strategyId);

    await page.goto("/mission-control");

    // The redesigned dashboard renders a monospace "Mission Control" feed where action == telemetry kind.
    // Wait for SSE snapshot(s) to arrive and assert we only see one completion.
    await expect(page.getByText("publish_completed")).toHaveCount(1, { timeout: 20_000 });
    await expect(page.getByText("publish_started")).toHaveCount(1);
  });
});

