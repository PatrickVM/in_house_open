-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('DAILY_MESSAGE', 'ANNOUNCEMENT', 'USER_SHARE', 'POLL', 'FORM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT', 'POLL', 'FORM');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('CHURCH_MEMBERS', 'ALL_USERS', 'ADMIN_ONLY');

-- CreateEnum
CREATE TYPE "UserMessageCategory" AS ENUM ('TESTIMONY', 'PRAYER_REQUEST', 'GOD_WINK');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('AUTO_APPROVED', 'PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "messageType" "MessageType" NOT NULL DEFAULT 'DAILY_MESSAGE',
    "status" "MessageStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL DEFAULT 'TEXT',
    "churchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "targetAudience" "TargetAudience" NOT NULL DEFAULT 'CHURCH_MEMBERS',
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "category" "UserMessageCategory",
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'AUTO_APPROVED',
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "moderationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessagePoll" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessagePoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageForm" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "formTitle" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollResponse" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedOptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_churchId_messageType_status_publishedAt_idx" ON "Message"("churchId", "messageType", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Message_churchId_targetAudience_expiresAt_idx" ON "Message"("churchId", "targetAudience", "expiresAt");

-- CreateIndex
CREATE INDEX "Message_messageType_status_moderationStatus_idx" ON "Message"("messageType", "status", "moderationStatus");

-- CreateIndex
CREATE INDEX "Message_expiresAt_idx" ON "Message"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessagePoll_messageId_key" ON "MessagePoll"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageForm_messageId_key" ON "MessageForm"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "PollResponse_pollId_userId_key" ON "PollResponse"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_formId_userId_key" ON "FormResponse"("formId", "userId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessagePoll" ADD CONSTRAINT "MessagePoll_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageForm" ADD CONSTRAINT "MessageForm_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResponse" ADD CONSTRAINT "PollResponse_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "MessagePoll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollResponse" ADD CONSTRAINT "PollResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "MessageForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
