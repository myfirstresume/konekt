/*
  Warnings:

  - Added the required column `blobUrl` to the `resume_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `resume_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `resume_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFileId` to the `resume_versions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_resume_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "resumeContent" TEXT NOT NULL,
    "appliedSuggestions" TEXT,
    "blobUrl" TEXT NOT NULL,
    "originalFileId" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "resume_versions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_resume_versions" ("appliedSuggestions", "createdAt", "id", "resumeContent", "updatedAt", "userId", "versionName") SELECT "appliedSuggestions", "createdAt", "id", "resumeContent", "updatedAt", "userId", "versionName" FROM "resume_versions";
DROP TABLE "resume_versions";
ALTER TABLE "new_resume_versions" RENAME TO "resume_versions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
