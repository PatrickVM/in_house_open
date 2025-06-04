-- AlterTable
ALTER TABLE "ChurchVerificationRequest" ADD COLUMN     "memberNotes" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifiedAt" TIMESTAMP(3);
