import { describe, expect, it } from "vitest";

import { appendStrategyOSMeta, extractStrategyOSMeta } from "../utils/stream-meta";

describe("stream-meta", () => {
  it("round-trips citations via footer and strips it on extract", () => {
    const input = "Hello world.\nSecond line.";
    const withMeta = appendStrategyOSMeta(input, {
      citations: [{ id: "c1", source: "web", title: "Example", url: "https://example.com" }],
    });

    const extracted = extractStrategyOSMeta(withMeta);
    expect(extracted.text).toBe(input);
    expect(extracted.meta?.citations?.[0]?.id).toBe("c1");
    expect(extracted.meta?.citations?.[0]?.source).toBe("web");
  });

  it("returns original text when footer is missing", () => {
    const input = "No footer";
    const extracted = extractStrategyOSMeta(input);
    expect(extracted.text).toBe(input);
    expect(extracted.meta).toBeNull();
  });
});

