/**
 * DATABASE SERVICE - Prisma Client Singleton
 * -------------------------------------------
 * Singleton instance prevents multiple connections in development.
 * Uses standard PrismaClient without native adapters for Next.js compatibility.
 */

import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use the explicit adapter to satisfy the "engine type client" requirement in Next.js/Turbopack
const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db"
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
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
