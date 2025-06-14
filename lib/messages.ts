import { MESSAGE_CONSTRAINTS } from "@/types/message";
import type {
  Message,
  MessageStatus,
  MessageWithRelations,
} from "@/types/message";

/**
 * Safely convert a date value to a Date object
 */
function ensureDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  return new Date(date);
}

/**
 * Calculate expiration date for a message (24 hours after publish)
 */
export function calculateExpirationDate(publishedAt: Date | string): Date {
  const publishDate = ensureDate(publishedAt);
  if (!publishDate) throw new Error("Invalid published date");

  const expirationDate = new Date(publishDate);
  expirationDate.setHours(
    expirationDate.getHours() + MESSAGE_CONSTRAINTS.AUTO_EXPIRE_HOURS
  );
  return expirationDate;
}

/**
 * Check if a message is expired
 */
export function isMessageExpired(message: Message): boolean {
  const expiresAt = ensureDate(message.expiresAt);
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Check if a message is currently active (published and not expired)
 */
export function isMessageActive(message: Message): boolean {
  const publishedAt = ensureDate(message.publishedAt);
  return (
    message.status === "PUBLISHED" &&
    publishedAt !== null &&
    !isMessageExpired(message)
  );
}

/**
 * Check if a message should be published (scheduled time has passed)
 */
export function shouldPublishMessage(message: Message): boolean {
  if (message.status !== "SCHEDULED" || !message.scheduledFor) {
    return false;
  }
  const scheduledFor = ensureDate(message.scheduledFor);
  if (!scheduledFor) return false;
  return new Date() >= scheduledFor;
}

/**
 * Get the display status for a message (handles auto-expired messages)
 */
export function getMessageDisplayStatus(message: Message): MessageStatus {
  if (message.status === "PUBLISHED" && isMessageExpired(message)) {
    return "EXPIRED";
  }
  return message.status;
}

/**
 * Format message content for display (basic markdown-like formatting)
 */
export function formatMessageContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/\n/g, "<br>") // Line breaks
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    ); // Links
}

/**
 * Get message author display name
 */
export function getMessageAuthorName(message: MessageWithRelations): string {
  const { createdBy } = message;

  if (message.isAnonymous) {
    return "Anonymous";
  }

  if (createdBy.firstName && createdBy.lastName) {
    return `${createdBy.firstName} ${createdBy.lastName}`;
  }

  return createdBy.email;
}

/**
 * Check if user can edit a message
 */
export function canEditMessage(message: Message, userId: string): boolean {
  // Only the creator can edit
  if (message.createdById !== userId) return false;

  // Can only edit drafts and scheduled messages
  return message.status === "DRAFT" || message.status === "SCHEDULED";
}

/**
 * Check if user can delete a message
 */
export function canDeleteMessage(message: Message, userId: string): boolean {
  // Only the creator can delete
  if (message.createdById !== userId) return false;

  // Can only delete drafts and scheduled messages
  return message.status === "DRAFT" || message.status === "SCHEDULED";
}

/**
 * Check if user can publish a message
 */
export function canPublishMessage(message: Message, userId: string): boolean {
  // Only the creator can publish
  if (message.createdById !== userId) return false;

  // Can only publish drafts
  return message.status === "DRAFT";
}

/**
 * Get time remaining until message expires
 */
export function getTimeUntilExpiration(message: Message): string | null {
  const expiresAt = ensureDate(message.expiresAt);
  if (!expiresAt) return null;

  const now = new Date();
  const msRemaining = expiresAt.getTime() - now.getTime();

  if (msRemaining <= 0) return "Expired";

  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (msRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  if (hoursRemaining > 0) {
    return `${hoursRemaining}h ${minutesRemaining}m remaining`;
  }

  return `${minutesRemaining}m remaining`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 30 minutes")
 */
export function getRelativeTime(date: Date | string): string {
  const targetDate = ensureDate(date);
  if (!targetDate) return "Unknown time";

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  const minutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

  const isPast = diffMs < 0;
  const suffix = isPast ? "ago" : "from now";

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ${suffix}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${suffix}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ${suffix}`;
  }

  return isPast ? "just now" : "in a moment";
}

/**
 * Validate message constraints for a church
 */
export function validateMessageConstraints(
  existingMessages: Message[],
  messageType: "DAILY_MESSAGE" | "ANNOUNCEMENT"
): { valid: boolean; error?: string } {
  // Check scheduled message limit
  const scheduledCount = existingMessages.filter(
    (msg) => msg.status === "SCHEDULED" || msg.status === "DRAFT"
  ).length;

  if (scheduledCount >= MESSAGE_CONSTRAINTS.MAX_SCHEDULED_MESSAGES) {
    return {
      valid: false,
      error: `You can only have ${MESSAGE_CONSTRAINTS.MAX_SCHEDULED_MESSAGES} scheduled messages at a time. Please publish or delete existing messages first.`,
    };
  }

  return { valid: true };
}

/**
 * Generate message preview text (truncated)
 */
export function getMessagePreview(
  content: string,
  maxLength: number = 100
): string {
  // Remove markdown formatting for preview
  const plainText = content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n/g, " ")
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength - 3) + "...";
}
