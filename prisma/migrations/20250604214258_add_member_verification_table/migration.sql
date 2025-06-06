-- CreateEnum
CREATE TYPE "VerificationAction" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "MemberVerification" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "verifierId" TEXT NOT NULL,
    "action" "VerificationAction" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberVerification_requestId_verifierId_key" ON "MemberVerification"("requestId", "verifierId");

-- AddForeignKey
ALTER TABLE "MemberVerification" ADD CONSTRAINT "MemberVerification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ChurchVerificationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberVerification" ADD CONSTRAINT "MemberVerification_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
