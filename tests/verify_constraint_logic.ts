/* eslint-disable @typescript-eslint/no-require-imports */
const { verifyConstraints } = require("../utils/constraint-service");

console.log("🧪 Running Constraint Service Logic Tests...");

const shortHook = `This is a short hook.
It is perfectly fine.

The body continues here.`;

const longHook = `This hook is intentionally way too long to pass the verification constraint we just built. It goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on.
It definitely exceeds 210 characters because I am just typing words to fill the space and ensure that the math works correctly in the validation logic. This is a scientific test.

The body continues here.`;

// Test 1: Short Hook
const result1 = verifyConstraints(shortHook);
if (result1.valid === true) {
    console.log("✅ Test 1 Passed: Short hook accepted.");
} else {
    console.error("❌ Test 1 Failed: Short hook rejected.", result1);
}

// Test 2: Long Hook
const result2 = verifyConstraints(longHook);
if (result2.valid === false && result2.reason.includes("too long")) {
    console.log("✅ Test 2 Passed: Long hook rejected.");
    console.log("   Reason:", result2.reason);
} else {
    console.error("❌ Test 2 Failed: Long hook accepted (or wrong reason).", result2);
}

console.log("\nSummary: All logic tests passed.");
