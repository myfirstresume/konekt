/*
  Warnings:

  - You are about to drop the column `blobUrl` on the `resume_versions` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `resume_versions` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `resume_versions` table. All the data in the column will be lost.
  - You are about to drop the column `originalFileId` on the `resume_versions` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "resume_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "resumeHash" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "positionStart" INTEGER NOT NULL,
    "positionEnd" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "referenceText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "resume_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_resume_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "resumeContent" TEXT NOT NULL,
    "appliedSuggestions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "resume_versions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_resume_versions" ("appliedSuggestions", "createdAt", "id", "resumeContent", "updatedAt", "userId", "versionName") SELECT "appliedSuggestions", "createdAt", "id", "resumeContent", "updatedAt", "userId", "versionName" FROM "resume_versions";
DROP TABLE "resume_versions";
ALTER TABLE "new_resume_versions" RENAME TO "resume_versions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
