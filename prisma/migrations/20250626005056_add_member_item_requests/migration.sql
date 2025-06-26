-- CreateEnum
CREATE TYPE "MemberRequestStatus" AS ENUM ('REQUESTED', 'RECEIVED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "memberDescription" TEXT,
ADD COLUMN     "offerToMembers" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MemberItemRequest" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "MemberRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "memberNotes" TEXT,

    CONSTRAINT "MemberItemRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberItemRequest_userId_status_idx" ON "MemberItemRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "MemberItemRequest_churchId_status_idx" ON "MemberItemRequest"("churchId", "status");

-- CreateIndex
CREATE INDEX "MemberItemRequest_expiresAt_idx" ON "MemberItemRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MemberItemRequest_itemId_userId_key" ON "MemberItemRequest"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "MemberItemRequest" ADD CONSTRAINT "MemberItemRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberItemRequest" ADD CONSTRAINT "MemberItemRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberItemRequest" ADD CONSTRAINT "MemberItemRequest_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
