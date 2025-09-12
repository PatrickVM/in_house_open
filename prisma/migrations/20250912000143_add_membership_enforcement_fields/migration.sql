-- AlterTable
ALTER TABLE "User" ADD COLUMN     "disabledReason" TEXT,
ADD COLUMN     "membershipDeadlineDate" TIMESTAMP(3),
ADD COLUMN     "membershipEnforcementExempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "warningEmailSentAt" TIMESTAMP(3);
