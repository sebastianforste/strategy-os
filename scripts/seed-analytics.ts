
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Analytics Data...");

  // clear
  await prisma.strategy.deleteMany({});
  await prisma.user.deleteMany({}); // Delete users too to avoid unique constraint if re-running

  // 0. Create User
  const user = await prisma.user.create({
      data: {
          name: "Test User",
          email: "test@strategyos.example", // Creating fresh user each time (after delete)
          image: "https://example.com/me.jpg"
      }
  });

  // 1. Create Personal Posts (CSO)
  await prisma.strategy.create({
    data: {
      content: "AI is eating the world.",
      platform: "LINKEDIN",
      persona: "cso",
      impressions: 5000,

      shares: 10,
      isTeamPost: false,
      isPublished: true,
      authorId: user.id
    }
  });

  await prisma.strategy.create({
    data: {
      content: "Strategic divergence is key.",
      platform: "LINKEDIN",
      persona: "contrarian",
      impressions: 2500,

      shares: 5,
      isTeamPost: false,
      isPublished: true,
      authorId: user.id
    }
  });

  // 2. Create Team Posts (Employee Advocacy)
  await prisma.strategy.create({
    data: {
      content: "So proud to work internally on this.",
      platform: "LINKEDIN",
      persona: "colleague_dynamic", 
      impressions: 1200,

      shares: 2,
      isTeamPost: true,
      isPublished: true,
      teamMemberName: "Sarah",
      teamMemberRole: "CTO",
      authorId: user.id
    }
  });

  await prisma.strategy.create({
    data: {
      content: "Our sales figures are up 20%!",
      platform: "LINKEDIN",
      persona: "colleague_dynamic",
      impressions: 800,

      shares: 1,
      isTeamPost: true,
      isPublished: true,
      teamMemberName: "Mike",
      teamMemberRole: "VP Sales",
      authorId: user.id
    }
  });

  await prisma.strategy.create({
    data: {
      content: "Technical debt is real.",
      platform: "LINKEDIN",
      persona: "colleague_dynamic",
      impressions: 1500,

      shares: 4,
      isTeamPost: true,
      isPublished: true,
      teamMemberName: "Sarah",
      teamMemberRole: "CTO",
      authorId: user.id
    }
  });

  console.log("✅ Seed complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
