import { MESSAGE_CONSTRAINTS } from "@/types/message";
import type {
  Message,
  MessageStatus,
  MessageWithRelations,
} from "@/types/message";

/**
 * Ensure date is a proper Date object
 */
function ensureDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Calculate when a message should expire (24 hours after publication)
 */
export function calculateExpirationDate(publishedAt: Date): Date {
  const expiresAt = new Date(publishedAt);
  expiresAt.setHours(
    expiresAt.getHours() + MESSAGE_CONSTRAINTS.AUTO_EXPIRE_HOURS
  );
  return expiresAt;
}

/**
 * Check if a message is currently active (published and not expired)
 */
export function isMessageActive(message: Message): boolean {
  if (message.status !== "PUBLISHED") return false;

  const expiresAt = ensureDate(message.expiresAt);
  if (!expiresAt) return false;

  return new Date() < expiresAt;
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
 * Get a human-readable display status for a message
 */
export function getMessageDisplayStatus(message: Message): string {
  // Check if expired first
  if (message.status === "PUBLISHED") {
    const expiresAt = ensureDate(message.expiresAt);
    if (expiresAt && new Date() >= expiresAt) {
      return "EXPIRED";
    }
  }

  return message.status;
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
 * Check if user can delete a user message (for church/admin management)
 */
export function canDeleteUserMessage(
  message: Message,
  userId: string,
  userRole: string,
  churchLeadContactId?: string
): boolean {
  // Only for USER_SHARE messages
  if (message.messageType !== "USER_SHARE") return false;

  // Admins can delete any user message
  if (userRole === "ADMIN") return true;

  // Church lead contacts can delete messages from their church
  if (userRole === "CHURCH" && churchLeadContactId === userId) return true;

  return false;
}

/**
 * Check if user can publish a message
 */
export function canPublishMessage(message: Message, userId: string): boolean {
  // Only the creator can publish
  if (message.createdById !== userId) return false;

  // Can only publish draft messages
  return message.status === "DRAFT";
}

/**
 * Get the author name for display (handles anonymous messages)
 */
export function getMessageAuthorName(
  message: Message & {
    createdBy: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  },
  viewerRole?: string,
  isChurchDashboard = false
): string {
  // If message is anonymous and viewer shouldn't see real name
  if (message.isAnonymous && !isChurchDashboard && viewerRole !== "ADMIN") {
    return "Fellow Member";
  }

  // Show real name
  if (message.createdBy.firstName && message.createdBy.lastName) {
    return `${message.createdBy.firstName} ${message.createdBy.lastName}`;
  }

  return message.createdBy.email;
}

/**
 * Get user message category display info
 */
export function getUserMessageCategoryInfo(category: string): {
  label: string;
  icon: string;
  color: string;
} {
  switch (category) {
    case "TESTIMONY":
      return {
        label: "Testimony",
        icon: "🙏",
        color: "text-blue-600 border-blue-200",
      };
    case "PRAYER_REQUEST":
      return {
        label: "Prayer Request",
        icon: "💭",
        color: "text-purple-600 border-purple-200",
      };
    case "GOD_WINK":
      return {
        label: "God Wink",
        icon: "✨",
        color: "text-yellow-600 border-yellow-200",
      };
    default:
      return {
        label: "Shared Message",
        icon: "💬",
        color: "text-gray-600 border-gray-200",
      };
  }
}

/**
 * Format message content for display (basic markdown support)
 */
export function formatMessageContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const messageDate = ensureDate(date);
  if (!messageDate) return "Unknown";

  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return messageDate.toLocaleDateString();
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
 * Get all messages for a church (including user messages)
 */
export async function getMessagesForChurch(
  churchId: string,
  includeUserMessages = true
): Promise<Message[]> {
  // This would be implemented in the API routes
  // Placeholder for the function signature
  throw new Error("Not implemented - use API routes instead");
}

/**
 * Validate message constraints for a church
 */
export function validateMessageConstraints(
  existingMessages: Message[],
  messageType: "DAILY_MESSAGE" | "ANNOUNCEMENT"
): { valid: boolean; error?: string } {
  // Check scheduled message limit (only applies to church messages)
  const scheduledCount = existingMessages.filter(
    (msg) =>
      (msg.status === "SCHEDULED" || msg.status === "DRAFT") &&
      (msg.messageType === "DAILY_MESSAGE" ||
        msg.messageType === "ANNOUNCEMENT")
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
