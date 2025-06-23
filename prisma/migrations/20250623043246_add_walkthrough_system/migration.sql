/*
  Warnings:

  - You are about to drop the column `createdAt` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FormResponse` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[formId,responderId]` on the table `FormResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `responderId` to the `FormResponse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_userId_fkey";

-- DropIndex
DROP INDEX "FormResponse_formId_userId_key";

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "responderId" TEXT NOT NULL,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "WalkthroughProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalkthroughProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalkthroughAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userRole" TEXT NOT NULL,

    CONSTRAINT "WalkthroughAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalkthroughProgress_userId_stepId_version_key" ON "WalkthroughProgress"("userId", "stepId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_formId_responderId_key" ON "FormResponse"("formId", "responderId");

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkthroughProgress" ADD CONSTRAINT "WalkthroughProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkthroughAnalytics" ADD CONSTRAINT "WalkthroughAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
