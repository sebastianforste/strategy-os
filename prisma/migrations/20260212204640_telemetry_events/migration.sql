-- CreateTable
CREATE TABLE "TelemetryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "requestId" TEXT,
    "route" TEXT,
    "status" INTEGER,
    "latencyMs" INTEGER,
    "metadata" JSONB,
    "authorId" TEXT,
    "teamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelemetryEvent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TelemetryEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TelemetryEvent_authorId_createdAt_idx" ON "TelemetryEvent"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "TelemetryEvent_teamId_createdAt_idx" ON "TelemetryEvent"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "TelemetryEvent_kind_createdAt_idx" ON "TelemetryEvent"("kind", "createdAt");
