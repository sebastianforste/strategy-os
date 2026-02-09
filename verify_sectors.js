
// Manually transpiled to JS to avoid build tool issues
const { processInput } = require("./actions/generate");
const { SECTORS } = require("./utils/sectors");

async function verifySectorGeneration() {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  console.log("🚀 Verifying Sector-Specific Generation (JS Mode)...");

  const testCases = [
    { sectorId: "saas", input: "How to scale a business" },
    { sectorId: "real_estate", input: "How to scale a business" },
    { sectorId: "creator", input: "How to scale a business" }
  ];

  for (const test of testCases) {
    console.log(`\n-----------------------------------`);
    console.log(`Testing Sector: ${SECTORS[test.sectorId].name}`);
    console.log(`Input: "${test.input}"`);
    console.log(`Expecting Jargon: ${SECTORS[test.sectorId].jargon.join(", ")}`);
    
    try {
      const result = await processInput(
        test.input,
        { gemini: geminiKey },
        "cso", // Default persona
        false, // No trends
        "linkedin",
        false, // No few-shot
        undefined, // Custom Persona
        false, // Team mode
        undefined, // Colleague Name
        undefined, // Colleague Role
        undefined, // Colleague Relation
        undefined, // Style DNA
        "professional", // Sub-style
        false, // Top Voice Mode
        test.sectorId // Cast for now if types aren't fully picked up in script
      );

      console.log(`\nGenerated Output Preview:\n${result.textPost.substring(0, 300)}...`);
      
      const jargonFound = SECTORS[test.sectorId].jargon.filter(term => 
        result.textPost.toLowerCase().includes(term.toLowerCase())
      );

      if (jargonFound.length > 0) {
        console.log(`✅ SUCCESS: Found sector jargon: ${jargonFound.join(", ")}`);
      } else {
        console.log(`⚠️ WARNING: No specific sector jargon found. Check prompt injection.`);
      }

    } catch (e) {
      console.error(`❌ FAILED:`, e);
    }
  }
}

verifySectorGeneration();
