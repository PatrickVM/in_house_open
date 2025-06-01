-- CreateEnum
CREATE TYPE "ChurchMembershipStatus" AS ENUM ('NONE', 'REQUESTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Church" ADD COLUMN     "minVerificationsRequired" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "requiresVerification" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "churchId" TEXT,
ADD COLUMN     "churchJoinRequestedAt" TIMESTAMP(3),
ADD COLUMN     "churchMembershipStatus" "ChurchMembershipStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "ChurchVerificationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "verifierId" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "ChurchVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChurchVerificationRequest_userId_churchId_key" ON "ChurchVerificationRequest"("userId", "churchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchVerificationRequest" ADD CONSTRAINT "ChurchVerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchVerificationRequest" ADD CONSTRAINT "ChurchVerificationRequest_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchVerificationRequest" ADD CONSTRAINT "ChurchVerificationRequest_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
