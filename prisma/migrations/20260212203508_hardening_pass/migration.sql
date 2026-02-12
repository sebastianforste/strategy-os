/*
  Warnings:

  - You are about to alter the column `assets` on the `Strategy` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "tags" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "teamId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "authorId" TEXT,
    "teamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Resource_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Resource" ("createdAt", "id", "metadata", "teamId", "title", "type", "updatedAt", "url") SELECT "createdAt", "id", "metadata", "teamId", "title", "type", "updatedAt", "url" FROM "Resource";
DROP TABLE "Resource";
ALTER TABLE "new_Resource" RENAME TO "Resource";
CREATE TABLE "new_Strategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "title" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'LINKEDIN',
    "persona" TEXT NOT NULL DEFAULT 'cso',
    "input" TEXT NOT NULL DEFAULT '',
    "assets" JSONB,
    "rating" TEXT,
    "score" INTEGER,
    "impressions" INTEGER,
    "engagement" REAL,
    "saves" INTEGER DEFAULT 0,
    "shares" INTEGER DEFAULT 0,
    "reach" INTEGER DEFAULT 0,
    "dwellScore" REAL DEFAULT 0.0,
    "mode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "externalId" TEXT,
    "complianceScore" INTEGER DEFAULT 100,
    "complianceNotes" TEXT,
    "isTeamPost" BOOLEAN NOT NULL DEFAULT false,
    "teamMemberName" TEXT,
    "teamMemberRole" TEXT,
    "authorId" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Strategy_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Strategy_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Strategy" ("assets", "authorId", "content", "createdAt", "dwellScore", "engagement", "externalId", "id", "impressions", "input", "isPublished", "isTeamPost", "mode", "persona", "platform", "publishedAt", "rating", "reach", "saves", "score", "shares", "teamId", "teamMemberName", "teamMemberRole", "title", "updatedAt") SELECT "assets", "authorId", "content", "createdAt", "dwellScore", "engagement", "externalId", "id", "impressions", "input", "isPublished", "isTeamPost", "mode", "persona", "platform", "publishedAt", "rating", "reach", "saves", "score", "shares", "teamId", "teamMemberName", "teamMemberRole", "title", "updatedAt" FROM "Strategy";
DROP TABLE "Strategy";
ALTER TABLE "new_Strategy" RENAME TO "Strategy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_teamId_email_key" ON "Invitation"("teamId", "email");
