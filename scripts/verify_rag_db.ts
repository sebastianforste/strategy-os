
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying RAG Context Access...");

  // 1. Create a dummy resource if none exist
  const existing = await prisma.resource.findFirst({ where: { type: 'pdf' } });
  if (!existing) {
      console.log("📝 Creating mock resource for testing...");
      await prisma.resource.create({
          data: {
              title: "Q3 Strategy Report",
              type: "pdf",
              url: "/docs/q3_strategy.pdf",
              metadata: {
                  summary: "Focus on viral growth and LinkedIn video.",
                  date: "2025-08-15",
                  document_type: "Strategy Doc"
              }
          }
      });
  }

  // 2. Simulate fetchContext logic
  const resources = await prisma.resource.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { type: 'pdf' }
  });

  console.log(`✅ Found ${resources.length} resources.`);
  
  const contextItems = resources.map((r: any) => {
      const meta = r.metadata || {};
      return `- [${r.title}] (Type: ${meta.document_type || 'Doc'}) Summary: ${meta.summary || r.metadata}`;
  }).join("\n");

  console.log("\n--- GENERATED CONTEXT STRING ---");
  console.log(contextItems);
  console.log("--------------------------------\n");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
