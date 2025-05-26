-- AlterTable
ALTER TABLE "Church" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "moderationNotes" TEXT,
ADD COLUMN     "moderationStatus" TEXT NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
