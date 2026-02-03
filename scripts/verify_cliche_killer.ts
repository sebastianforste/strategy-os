
import { detectCliches } from "../utils/cliche-detector";

function verify() {
  console.log("🛡️ Verifying Cliche Killer...");

  const testCases = [
    {
      text: "We need to delve into this robust landscape.",
      expected: ["delve", "robust", "landscape"]
    },
    {
      text: "It is a testament to our innovative framework.",
      expected: ["testament", "innovative", "framework"]
    },
    {
      text: "This is a simple sentence.",
      expected: []
    }
  ];

  let passed = 0;

  testCases.forEach((t, i) => {
    const violations = detectCliches(t.text);
    const words = violations.map(v => v.word.toLowerCase());
    
    // Check if checks match
    const isMatch = t.expected.every(w => words.includes(w)) && words.length === t.expected.length;

    console.log(`\nTest Case ${i + 1}: "${t.text}"`);
    if (isMatch) {
      console.log("✅ Passed");
      passed++;
    } else {
      console.error(`❌ Failed. Expected [${t.expected}], got [${words}]`);
    }

    violations.forEach(v => {
        console.log(`   - Detected "${v.word}" at index ${v.index}. Suggestion: "${v.replacement}"`);
    });
  });

  if (passed === testCases.length) {
      console.log("\n🎉 All Cliche Killer tests passed!");
  } else {
      console.error("\n💥 Some tests failed.");
      process.exit(1);
  }
}

verify();
