-- CreateEnum
CREATE TYPE "PingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Ping" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "PingStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "autoAccept" BOOLEAN NOT NULL DEFAULT false,
    "autoReject" BOOLEAN NOT NULL DEFAULT false,
    "allowPingsFromAnyone" BOOLEAN NOT NULL DEFAULT true,
    "dailyPingLimit" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "PingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FCMToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ping_receiverId_status_idx" ON "Ping"("receiverId", "status");

-- CreateIndex
CREATE INDEX "Ping_senderId_status_idx" ON "Ping"("senderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Ping_senderId_receiverId_key" ON "Ping"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "PingPreferences_userId_key" ON "PingPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "FCMToken"("token");

-- CreateIndex
CREATE INDEX "FCMToken_userId_idx" ON "FCMToken"("userId");

-- AddForeignKey
ALTER TABLE "Ping" ADD CONSTRAINT "Ping_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ping" ADD CONSTRAINT "Ping_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PingPreferences" ADD CONSTRAINT "PingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FCMToken" ADD CONSTRAINT "FCMToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
