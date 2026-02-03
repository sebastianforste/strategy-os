
import { createColleaguePersona } from "../utils/colleague-persona";

console.log("🧪 Testing Colleague Persona Factory...");

const cto = createColleaguePersona("Sarah", "CTO", "Reporting Manager");
console.log("\n[Persona 1] Sarah (CTO):");
console.log("- Name:", cto.name);
console.log("- Role:", cto.role);
console.log("- Description:", cto.description);
console.log("- Prompt contains 'CTO'?", cto.basePrompt!.includes("CTO"));
console.log("- Prompt contains 'Sarah'?", cto.basePrompt!.includes("Sarah"));

const sales = createColleaguePersona("Mike", "VP of Sales");
console.log("\n[Persona 2] Mike (Sales):");
console.log("- Name:", sales.name);
console.log("- Prompt contains 'VP of Sales'?", sales.basePrompt!.includes("VP of Sales"));

if (!cto.basePrompt!.includes("CTO") || !sales.basePrompt!.includes("VP of Sales")) {
  console.error("❌ FAILED: Role not injected into prompt.");
  process.exit(1);
}

console.log("\n✅ Factory Logic Verified!");
