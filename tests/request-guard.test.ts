import { describe, expect, it, vi } from "vitest";

vi.mock("dns/promises", () => {
  return {
    default: {
      lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]),
    },
  };
});

import { assertSafeUrl, HttpError, parseJson } from "@/utils/request-guard";
import { z } from "zod";

describe("request-guard", () => {
  it("assertSafeUrl blocks localhost / loopback", async () => {
    await expect(assertSafeUrl("http://127.0.0.1/")).rejects.toBeInstanceOf(HttpError);
    await expect(assertSafeUrl("http://localhost/")).rejects.toBeInstanceOf(HttpError);
    await expect(assertSafeUrl("http://example.local/")).rejects.toBeInstanceOf(HttpError);
  });

  it("assertSafeUrl allows a public hostname (with mocked DNS)", async () => {
    const url = await assertSafeUrl("https://example.com/path");
    expect(url.hostname).toBe("example.com");
  });

  it("parseJson returns 400 on invalid JSON", async () => {
    const req = new Request("http://unit.test", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });

    await expect(parseJson(req, z.object({}))).rejects.toMatchObject({ status: 400 });
  });
});
