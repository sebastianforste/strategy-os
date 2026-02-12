-- CreateTable
CREATE TABLE "StrategyPublication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrategyPublication_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idempotencyKey" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "url" TEXT,
    "error" TEXT,
    "requestId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublishAttempt_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StrategyPublication_strategyId_platform_key" ON "StrategyPublication"("strategyId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "PublishAttempt_idempotencyKey_key" ON "PublishAttempt"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PublishAttempt_strategyId_updatedAt_idx" ON "PublishAttempt"("strategyId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PublishAttempt_strategyId_platform_key" ON "PublishAttempt"("strategyId", "platform");
