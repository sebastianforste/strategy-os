
import { evolutionServiceMolt } from "../utils/evolution-service-molt";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("🧬 Starting Persona Evolution Training Loop...");
    console.log("-----------------------------------------------");

    const submolts = ["strategy", "philosophy", "growth", "writing"];
    console.log(`📡 Scanning high-status submolts: ${submolts.join(", ")}`);

    try {
        const result = await evolutionServiceMolt.learnFromFeedback("global_mind", submolts);
        
        if (result.success) {
            console.log("\n✅ TRAINING COMPLETE");
            console.log(`Analyzed ${result.learnedCount} top-performing posts.`);
            console.log("New 'Style DNA' has been injected into the vector store.");
            console.log("Future posts will now mirror these viral patterns.");
        } else {
            console.error("\n❌ TRAINING FAILED");
        }
    } catch (error) {
        console.error("Critical Error in Training Loop:", error);
        process.exit(1);
    }
}

main();
