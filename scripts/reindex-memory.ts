/**
 * RE-INDEX MEMORY SCRIPT
 * ----------------------
 * Manually triggers the vector store to analyze style references and create clusters.
 * Use this after uploading new halls of fame or when performance data shifts.
 */

import { reindexStyleClusters } from "../utils/vector-store";

async function main() {
    console.log("🧬 Starting Advanced Style Re-indexing...");
    try {
        await reindexStyleClusters();
        console.log("✅ Style Memory Re-indexed Successfully.");
    } catch (e) {
        console.error("❌ Re-indexing failed:", e);
        process.exit(1);
    }
}

main();
