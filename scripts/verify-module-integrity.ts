
// Mock server-only before requiring anything
import Module from 'module';

const originalRequire = Module.prototype.require;
// @ts-ignore
Module.prototype.require = function(id) {
  if (id === 'server-only') {
    return {};
  }
  // @ts-ignore
  return originalRequire.apply(this, arguments);
};

import { generateSideAssetsAction } from "../actions/visuals";
import { runGhostAgentAction } from "../actions/generate";
import { constructEnrichedPrompt } from "../utils/prompt-builder";

async function verifyImports() {
    console.log("✅ Starting Module Integrity Check (with server-only mock)...");

    try {
        console.log("Checking actions/media-actions...");
        if (typeof generateSideAssetsAction !== 'function') throw new Error("generateSideAssetsAction is not a function");
        
        console.log("Checking actions/generate...");
        if (typeof runGhostAgentAction !== 'function') throw new Error("runGhostAgentAction is not a function");

        console.log("Checking utils/prompt-builder...");
        if (typeof constructEnrichedPrompt !== 'function') throw new Error("constructEnrichedPrompt is not a function");

        console.log("✅ All Key Modules Imported Successfully. No Circular Dependencies detected at load time.");
    } catch (error) {
        console.error("❌ Module Verification Failed:", error);
        process.exit(1);
    }
}

verifyImports();
