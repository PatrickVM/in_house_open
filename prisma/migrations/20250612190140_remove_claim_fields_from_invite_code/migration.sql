/*
  Warnings:

  - You are about to drop the column `claimed` on the `InviteCode` table. All the data in the column will be lost.
  - You are about to drop the column `claimedAt` on the `InviteCode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InviteCode" DROP COLUMN "claimed",
DROP COLUMN "claimedAt";
