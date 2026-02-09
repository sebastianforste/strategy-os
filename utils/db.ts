/**
 * DATABASE SERVICE - Prisma Client Singleton
 * -------------------------------------------
 * Singleton instance prevents multiple connections in development.
 * Uses standard PrismaClient without native adapters for Next.js compatibility.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- Convenience Types ---
export type {
  User,
  Team,
  Strategy,
  StrategyVersion,
  VoiceModel,
  AuditLog,
  Resource,
} from "@prisma/client";
