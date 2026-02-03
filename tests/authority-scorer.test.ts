
import { calculateAuthorityScore } from "../utils/authority-scorer";

const JUNIOR_TEXT = "I am so excited to announce that I joined the team today. It's great. We will do good things. I love my new job.";
const SENIOR_TEXT = "Today marks a strategic pivot in our market approach. By leveraging cross-functional synergies and anchoring our growth in 15% margin improvements, we have orchestrated a trajectory toward sustainable leadership. Execution isn't an option; it's our mandate.";

console.log("--- AUTHORITY SCORER TEST ---");

const junior = calculateAuthorityScore(JUNIOR_TEXT);
console.log("\n[JUNIOR SAMPLE]");
console.log(`Score: ${junior.score}`);
console.log(`Level: ${junior.level}`);
console.log("Suggestions:", junior.suggestions);

const senior = calculateAuthorityScore(SENIOR_TEXT);
console.log("\n[SENIOR SAMPLE]");
console.log(`Score: ${senior.score}`);
console.log(`Level: ${senior.level}`);
console.log("Breakdown:", senior.breakdown);

if (senior.score > junior.score) {
  console.log("\n✅ SUCCESS: Senior text scored higher than junior text.");
} else {
  console.log("\n❌ FAILURE: Scoring logic is inverted or insufficient.");
}
