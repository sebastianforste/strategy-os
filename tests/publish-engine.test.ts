import { beforeEach, describe, expect, it, vi } from "vitest";

let currentPublication: { externalId: string; url: string } | null = null;

const { createPost, createPostWithImage, getCurrentUserProfile } = vi.hoisted(() => ({
  createPost: vi.fn(),
  createPostWithImage: vi.fn(),
  getCurrentUserProfile: vi.fn(),
}));

vi.mock("../utils/linkedin-api-v2", () => ({
  createPost,
  createPostWithImage,
  getCurrentUserProfile,
}));

vi.mock("../utils/twitter-api", () => ({
  postTweet: vi.fn(),
  postThread: vi.fn(),
}));

vi.mock("../utils/platforms/twitter-api", () => ({
  splitIntoTweets: (text: string) => [text],
}));

vi.mock("../utils/telemetry", () => ({
  emitTelemetryEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../utils/db", () => {
  const prisma = {
    strategyPublication: {
      findUnique: vi.fn(async () => currentPublication),
      create: vi.fn(async ({ data }: any) => {
        currentPublication = { externalId: data.externalId, url: data.url };
        return data;
      }),
    },
    publishAttempt: {
      create: vi.fn().mockResolvedValue({ id: "pa_1" }),
      update: vi.fn().mockResolvedValue({ id: "pa_1" }),
    },
    strategy: {
      findUnique: vi.fn().mockResolvedValue({ id: "s_1", authorId: "u_1" }),
      update: vi.fn().mockResolvedValue({ id: "s_1" }),
    },
    account: {
      findFirst: vi.fn().mockResolvedValue({ access_token: "token" }),
    },
    $transaction: vi.fn(async (fn: any) => fn(prisma)),
  };
  return { prisma };
});

import { publishStrategy } from "../utils/publish-engine";

describe("publish-engine", () => {
  beforeEach(() => {
    currentPublication = null;
    vi.clearAllMocks();
    getCurrentUserProfile.mockResolvedValue({ personUrn: "urn:li:person:1", name: "Test" });
    createPost.mockResolvedValue({ success: true, postId: "li_post_1" });
    createPostWithImage.mockResolvedValue({ success: true, postId: "li_post_1" });
  });

  it("is idempotent for strategy+platform once a publication exists", async () => {
    const first = await publishStrategy({
      strategyId: "s_1",
      platform: "LINKEDIN",
      userId: "u_1",
      content: "hello",
    });
    expect(first.status).toBe("published");
    expect(createPost).toHaveBeenCalledTimes(1);

    const second = await publishStrategy({
      strategyId: "s_1",
      platform: "LINKEDIN",
      userId: "u_1",
      content: "hello",
    });
    expect(second.status).toBe("already_published");
    expect(createPost).toHaveBeenCalledTimes(1);
  });
});
