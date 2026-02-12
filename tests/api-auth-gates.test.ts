import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => {
  return {
    getServerSession: vi.fn(async () => null),
  };
});

describe("StrategyOS API auth gates", () => {
  it("scrape returns 401 when unauthenticated", async () => {
    const mod = await import("@/app/api/scrape/route");
    const req = new Request("http://unit.test/api/scrape", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(401);
  });

  it("ingest returns 401 when unauthenticated", async () => {
    const mod = await import("@/app/api/ingest/route");
    const req = new Request("http://unit.test/api/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: "x.pdf", metadata: { a: 1 }, content_summary: "hi" }),
    });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(401);
  });

  it("generate returns 401 when unauthenticated", async () => {
    const mod = await import("@/app/api/generate/route");
    const req = new Request("http://unit.test/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(401);
  });
});

