-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registrationDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" "BroadcastStatus" NOT NULL DEFAULT 'PENDING',
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "fileId" TEXT,
    "buttonText" TEXT,
    "buttonUrl" TEXT,
    "parseMode" TEXT DEFAULT 'HTML',
    "disableWebPreview" BOOLEAN NOT NULL DEFAULT false,
    "delayMs" INTEGER NOT NULL DEFAULT 100,
    "skipInactive" BOOLEAN NOT NULL DEFAULT true,
    "retryOnRateLimit" BOOLEAN NOT NULL DEFAULT true,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorLog" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lesson_isSubscriptionRequired_orderNumber_idx" ON "Lesson"("isSubscriptionRequired", "orderNumber");
