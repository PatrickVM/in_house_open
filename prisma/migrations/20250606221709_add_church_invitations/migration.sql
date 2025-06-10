-- CreateEnum
CREATE TYPE "ChurchInvitationStatus" AS ENUM ('PENDING', 'CLAIMED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "InviteCode" ADD COLUMN     "lastScannedAt" TIMESTAMP(3),
ADD COLUMN     "scans" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChurchInvitation" (
    "id" TEXT NOT NULL,
    "inviterEmail" TEXT NOT NULL,
    "inviterName" TEXT NOT NULL,
    "inviterPhone" TEXT,
    "churchEmail" TEXT NOT NULL,
    "customMessage" TEXT,
    "status" "ChurchInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "claimedByUserId" TEXT,

    CONSTRAINT "ChurchInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchInvitesSent" INTEGER NOT NULL DEFAULT 0,
    "userInvitesSent" INTEGER NOT NULL DEFAULT 0,
    "userInvitesScanned" INTEGER NOT NULL DEFAULT 0,
    "userInvitesCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationAnalytics_userId_key" ON "InvitationAnalytics"("userId");

-- AddForeignKey
ALTER TABLE "ChurchInvitation" ADD CONSTRAINT "ChurchInvitation_inviterEmail_fkey" FOREIGN KEY ("inviterEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchInvitation" ADD CONSTRAINT "ChurchInvitation_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationAnalytics" ADD CONSTRAINT "InvitationAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
