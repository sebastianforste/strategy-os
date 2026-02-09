
import { prisma } from "../utils/db";

async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Connection successful!");
    
    // Try a simple query
    const count = await prisma.strategy.count();
    console.log(`Found ${count} strategies.`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Connection failed:", e);
    process.exit(1);
  }
}

main();
