
import { describe, it, expect } from "vitest";
import { calculateAuthorityScore } from "../utils/authority-scorer";

const JUNIOR_TEXT = "I am so excited to announce that I joined the team today. It's great. We will do good things. I love my new job.";
const SENIOR_TEXT = "Today marks a strategic pivot in our market approach. By leveraging cross-functional synergies and anchoring our growth in 15% margin improvements, we have orchestrated a trajectory toward sustainable leadership. Execution isn't an option; it's our mandate.";

describe("Authority Scorer Logic", () => {
  it("should score senior professional text higher than junior excited text", () => {
    const junior = calculateAuthorityScore(JUNIOR_TEXT);
    const senior = calculateAuthorityScore(SENIOR_TEXT);

    console.log("\n[JUNIOR SAMPLE]");
    console.log(`Score: ${junior.score}`);
    console.log(`Level: ${junior.level}`);
    console.log("Suggestions:", junior.suggestions);

    console.log("\n[SENIOR SAMPLE]");
    console.log(`Score: ${senior.score}`);
    console.log(`Level: ${senior.level}`);
    console.log("Breakdown:", senior.breakdown);

    expect(senior.score).toBeGreaterThan(junior.score);
  });
});
