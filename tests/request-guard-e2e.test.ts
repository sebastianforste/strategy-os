import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("next-auth", () => {
  return {
    getServerSession: vi.fn(async () => null),
  };
});

// The demo-auth path upserts a user. Stub prisma to avoid touching a real DB.
vi.mock("@/utils/db", () => {
  return {
    prisma: {
      user: {
        upsert: vi.fn(async () => ({ id: "e2e-user" })),
      },
    },
  };
});

import { HttpError, requireSessionForRequest } from "@/utils/request-guard";
import { getServerSession } from "next-auth";

describe("request-guard (e2e token gating)", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
    vi.mocked(getServerSession).mockResolvedValue(null as any);
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.clearAllMocks();
  });

  it("throws 401 when unauthenticated and demo auth is not enabled", async () => {
    process.env.E2E_DEMO_AUTH = "false";
    process.env.E2E_TEST_UTILS = "false";
    process.env.E2E_TOKEN = "";

    const req = new Request("http://unit.test/api", { headers: {} });
    await expect(requireSessionForRequest(req)).rejects.toMatchObject({ status: 401 });
  });

  it("throws 404 when demo auth is enabled but token is missing", async () => {
    process.env.E2E_DEMO_AUTH = "true";
    process.env.E2E_TEST_UTILS = "true";
    process.env.E2E_TOKEN = "playwright";

    const req = new Request("http://unit.test/api", { headers: {} });
    await expect(requireSessionForRequest(req)).rejects.toBeInstanceOf(HttpError);
    await expect(requireSessionForRequest(req)).rejects.toMatchObject({ status: 404 });
  });

  it("returns a demo session when demo auth is enabled and token matches", async () => {
    process.env.E2E_DEMO_AUTH = "true";
    process.env.E2E_TEST_UTILS = "true";
    process.env.E2E_TOKEN = "playwright";
    process.env.E2E_DEMO_USER_ID = "e2e-user";
    process.env.E2E_DEMO_USER_EMAIL = "e2e@local.test";
    process.env.E2E_DEMO_USER_NAME = "E2E User";

    const req = new Request("http://unit.test/api", {
      headers: { "x-e2e-token": "playwright" },
    });
    const session = await requireSessionForRequest(req);
    expect(session.user.id).toBe("e2e-user");
    expect(session.user.email).toBe("e2e@local.test");
  });
});

