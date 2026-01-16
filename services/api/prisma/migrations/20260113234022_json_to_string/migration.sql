-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EngineOutput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "freeOutput" TEXT NOT NULL,
    "paidOutput" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EngineOutput_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EngineRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EngineOutput" ("createdAt", "freeOutput", "id", "paidOutput", "runId") SELECT "createdAt", "freeOutput", "id", "paidOutput", "runId" FROM "EngineOutput";
DROP TABLE "EngineOutput";
ALTER TABLE "new_EngineOutput" RENAME TO "EngineOutput";
CREATE UNIQUE INDEX "EngineOutput_runId_key" ON "EngineOutput"("runId");
CREATE TABLE "new_EngineRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "engineId" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "inputs" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EngineRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EngineRun" ("anonymousId", "createdAt", "engineId", "id", "inputs", "status", "userId") SELECT "anonymousId", "createdAt", "engineId", "id", "inputs", "status", "userId" FROM "EngineRun";
DROP TABLE "EngineRun";
ALTER TABLE "new_EngineRun" RENAME TO "EngineRun";
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "engineId" TEXT,
    "userId" TEXT,
    "anonymousId" TEXT,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("anonymousId", "createdAt", "engineId", "id", "meta", "type", "userId") SELECT "anonymousId", "createdAt", "engineId", "id", "meta", "type", "userId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
