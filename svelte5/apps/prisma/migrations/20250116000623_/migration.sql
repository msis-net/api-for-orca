-- CreateTable
CREATE TABLE "weborca" (
    "pkey" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "debug" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "url" TEXT,
    "certificate" TEXT,
    "certBinary" BLOB,
    "certPassword" TEXT,
    "certExpiry" TEXT,
    "loginId" TEXT,
    "loginPassword" TEXT
);
