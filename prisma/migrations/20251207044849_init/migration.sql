-- CreateTable
CREATE TABLE "UserUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uploaderName" TEXT NOT NULL,
    "uploaderEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "species" TEXT,
    "huntDate" DATETIME,
    "region" TEXT,
    "weight" REAL,
    "weightUnit" TEXT DEFAULT 'lb',
    "points" INTEGER,
    "weaponType" TEXT,
    "caliber" TEXT,
    "eventDate" DATETIME,
    "category" TEXT,
    "participants" TEXT,
    "rejectionReason" TEXT
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "thumbnailPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "UserUpload" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
