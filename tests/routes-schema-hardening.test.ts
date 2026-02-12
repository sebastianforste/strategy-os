import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => {
  return {
    getServerSession: vi.fn(async () => {
      return {
        user: {
          id: "u_1",
          email: "u1@unit.test",
          name: "Unit User",
          image: null,
          role: "ADMIN",
          teamId: null,
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      };
    }),
  };
});

const prismaMock = {
  strategy: {
    create: vi.fn(async ({ data }: any) => {
      return {
        id: "s_1",
        createdAt: new Date(1_700_000_000_000),
        updatedAt: new Date(1_700_000_000_000),
        input: data.input,
        persona: data.persona,
        assets: data.assets,
        rating: null,
        engagement: 0,
        shares: 0,
        impressions: 0,
      };
    }),
  },
  resource: {
    create: vi.fn(async () => {
      throw new Error("resource.create should not be called in this test");
    }),
  },
};

vi.mock("@/utils/db", () => {
  return { prisma: prismaMock };
});

describe("Schema hardening (history + ingest)", () => {
  it("history POST rejects unknown asset keys (assets is strict)", async () => {
    const mod = await import("@/app/api/history/route");
    const req = new Request("http://unit.test/api/history", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: "hello",
        assets: { textPost: "x", unknownKey: "nope" },
      }),
    });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(400);
  });

  it("history POST accepts assets.citations (max 30) and returns 201", async () => {
    const mod = await import("@/app/api/history/route");
    const req = new Request("http://unit.test/api/history", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: "hello",
        assets: {
          textPost: "post",
          citations: [
            {
              id: "resource:1:abc:0",
              source: "web",
              title: "Example",
              url: "https://example.com",
              chunkIndex: 0,
              start: 0,
              end: 10,
            },
          ],
        },
      }),
    });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(201);
    expect(prismaMock.strategy.create).toHaveBeenCalledTimes(1);
  });

  it("ingest POST rejects oversized metadata", async () => {
    const mod = await import("@/app/api/ingest/route");
    const req = new Request("http://unit.test/api/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: "x.pdf",
        metadata: { big: "x".repeat(60_000) },
        content_summary: "hi",
      }),
    });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(400);
    expect(prismaMock.resource.create).toHaveBeenCalledTimes(0);
  });
});

