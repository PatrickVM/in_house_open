import { z } from "zod";
import { MESSAGE_CONSTRAINTS } from "@/types/message";

// Base message validation
export const messageContentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(
      MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH,
      `Message must be less than ${MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH} characters`
    ),
});

// Create message schema for church dashboard
export const createMessageSchema = messageContentSchema.extend({
  messageType: z
    .enum(["DAILY_MESSAGE", "ANNOUNCEMENT"])
    .default("DAILY_MESSAGE"),
  scheduledFor: z
    .string()
    .refine(
      (str) => {
        // Handle both datetime-local format and ISO string format
        const date = new Date(str);
        return !isNaN(date.getTime());
      },
      {
        message: "Invalid datetime format",
      }
    )
    .refine(
      (str) => {
        const date = new Date(str);
        const now = new Date();
        return date > now;
      },
      {
        message: "Scheduled time must be in the future",
      }
    )
    .transform((str) => new Date(str))
    .optional(),
});

// Update message schema
export const updateMessageSchema = z.object({
  title: z
    .string()
    .max(100, "Title must be less than 100 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(
      MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH,
      `Message must be less than ${MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH} characters`
    )
    .optional(),
  scheduledFor: z
    .string()
    .refine(
      (str) => {
        // Handle both datetime-local format and ISO string format
        const date = new Date(str);
        return !isNaN(date.getTime());
      },
      {
        message: "Invalid datetime format",
      }
    )
    .refine(
      (str) => {
        const date = new Date(str);
        const now = new Date();
        return date > now;
      },
      {
        message: "Scheduled time must be in the future",
      }
    )
    .transform((str) => new Date(str))
    .optional(),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
});

// User message schema (future use)
export const createUserMessageSchema = messageContentSchema.extend({
  category: z.enum(["TESTIMONY", "PRAYER_REQUEST", "GOD_WINK"]),
  isAnonymous: z.boolean().default(false),
});

// Message filters schema
export const messageFiltersSchema = z.object({
  status: z
    .array(z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED", "ARCHIVED"]))
    .optional(),
  messageType: z
    .array(z.enum(["DAILY_MESSAGE", "ANNOUNCEMENT", "USER_SHARE"]))
    .optional(),
  dateFrom: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  dateTo: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  includeExpired: z.boolean().default(false),
});

// Publish message schema
export const publishMessageSchema = z.object({
  publishNow: z.boolean().default(true),
});

// Archive message schema
export const archiveMessageSchema = z.object({
  reason: z
    .string()
    .max(255, "Reason must be less than 255 characters")
    .optional(),
});

// Query parameter schemas for API endpoints
export const messagesQuerySchema = z.object({
  page: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val ?? "1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Page must be a number greater than or equal to 1",
    }),
  limit: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val ?? "20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
      message: "Limit must be a number between 1 and 100",
    }),
  status: z.string().optional(),
  messageType: z.string().optional(),
  includeExpired: z.coerce.boolean().default(false),
});

export const activeMessagesQuerySchema = z.object({
  limit: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val ?? "5")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1 && val <= 10, {
      message: "Limit must be a number between 1 and 10",
    }),
});

// Type exports for use in components
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type CreateUserMessageInput = z.infer<typeof createUserMessageSchema>;
export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>;
export type MessagesQueryInput = z.infer<typeof messagesQuerySchema>;
export type ActiveMessagesQueryInput = z.infer<
  typeof activeMessagesQuerySchema
>;
