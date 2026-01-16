-- CreateTable
CREATE TABLE "EngineDefinition" (
    "engineId" TEXT NOT NULL PRIMARY KEY,
    "engineJson" TEXT NOT NULL,
    "contentMapJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeoGenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engineId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "overwrite" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engineId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "schemaJson" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeoSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engineId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'weekly',
    "dayOfWeek" INTEGER NOT NULL DEFAULT 1,
    "hour" INTEGER NOT NULL DEFAULT 9,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "mode" TEXT NOT NULL DEFAULT 'weekly_pack_v1',
    "pagesPerRun" INTEGER NOT NULL DEFAULT 1,
    "autoPublish" BOOLEAN NOT NULL DEFAULT true,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeoScheduleRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "jobId" TEXT,
    "publishedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedReason" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeoScheduleRun_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "SeoSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_engineId_slug_key" ON "SeoPage"("engineId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "SeoSchedule_engineId_key" ON "SeoSchedule"("engineId");
