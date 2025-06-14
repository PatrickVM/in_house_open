export type MessageType =
  | "DAILY_MESSAGE"
  | "ANNOUNCEMENT"
  | "USER_SHARE"
  | "POLL"
  | "FORM";

export type MessageStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "EXPIRED"
  | "ARCHIVED";

export type ContentType = "TEXT" | "POLL" | "FORM";

export type TargetAudience = "CHURCH_MEMBERS" | "ALL_USERS" | "ADMIN_ONLY";

export type UserMessageCategory = "TESTIMONY" | "PRAYER_REQUEST" | "GOD_WINK";

export type ModerationStatus =
  | "AUTO_APPROVED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "FLAGGED";

export interface Message {
  id: string;
  title?: string;
  messageType: MessageType;
  status: MessageStatus;
  content: string;
  contentType: ContentType;
  churchId: string;
  createdById: string;
  targetAudience: TargetAudience;
  scheduledFor?: Date | string;
  publishedAt?: Date | string;
  expiresAt?: Date | string;
  category?: UserMessageCategory;
  isAnonymous: boolean;
  moderationStatus: ModerationStatus;
  moderatedAt?: Date | string;
  moderatedById?: string;
  moderationNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MessageWithRelations extends Message {
  church: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  createdBy: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  moderatedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface CreateMessageData {
  title?: string;
  content: string;
  messageType?: MessageType;
  scheduledFor?: Date;
  category?: UserMessageCategory;
  isAnonymous?: boolean;
}

export interface UpdateMessageData {
  title?: string;
  content?: string;
  scheduledFor?: Date;
  status?: MessageStatus;
}

export interface MessageFilters {
  status?: MessageStatus[];
  messageType?: MessageType[];
  dateFrom?: Date;
  dateTo?: Date;
  includeExpired?: boolean;
}

export interface MessageStats {
  totalMessages: number;
  activeMessages: number;
  scheduledMessages: number;
  expiredMessages: number;
  draftMessages: number;
}

// Constants
export const MESSAGE_CONSTRAINTS = {
  MAX_SCHEDULED_MESSAGES: 5,
  MAX_CONTENT_LENGTH: 500,
  AUTO_EXPIRE_HOURS: 24,
} as const;

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  DAILY_MESSAGE: "Daily Message",
  ANNOUNCEMENT: "Announcement",
  USER_SHARE: "User Share",
  POLL: "Poll",
  FORM: "Form",
} as const;

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  EXPIRED: "Expired",
  ARCHIVED: "Archived",
} as const;

export const USER_MESSAGE_CATEGORY_LABELS: Record<UserMessageCategory, string> =
  {
    TESTIMONY: "Testimony",
    PRAYER_REQUEST: "Prayer Request",
    GOD_WINK: "God Wink",
  } as const;
