export type ActivityCategory =
  | "walkthrough"
  | "invitation"
  | "church"
  | "content"
  | "user"
  | "admin";

export type ActivityAction =
  // Walkthrough actions
  | "completed_walkthrough"
  | "started_walkthrough"
  | "abandoned_walkthrough"
  // Invitation actions
  | "sent_invitation"
  | "claimed_invitation"
  | "invitation_expired"
  // Church actions
  | "church_application_submitted"
  | "church_application_approved"
  | "church_application_rejected"
  | "member_joined_church"
  | "member_left_church"
  // Content actions
  | "message_posted"
  | "message_moderated"
  | "item_posted"
  | "item_claimed"
  | "item_completed"
  // User actions
  | "user_registered"
  | "profile_updated"
  // Admin actions
  | "admin_action_performed";

export interface WalkthroughActivityDetails {
  role: "USER" | "CHURCH";
  stepCount: number;
  completionTime: number; // seconds
  version: string;
}

export interface InvitationActivityDetails {
  invitationType: "church" | "user";
  recipientEmail: string;
  invitationId?: string;
}

export interface ChurchActivityDetails {
  churchId: string;
  churchName: string;
  applicationId?: string;
}

export interface ContentActivityDetails {
  contentType: "message" | "item";
  contentId: string;
  contentTitle: string;
  moderationAction?: "approved" | "rejected" | "flagged";
}

export interface UserActivityDetails {
  profileFields?: string[];
  registrationSource?: string;
}

export interface AdminActivityDetails {
  action: string;
  targetType?: string;
  targetId?: string;
}

export type ActivityDetails =
  | WalkthroughActivityDetails
  | InvitationActivityDetails
  | ChurchActivityDetails
  | ContentActivityDetails
  | UserActivityDetails
  | AdminActivityDetails;

export interface ActivityLogData {
  userId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  category: ActivityCategory;
  action: ActivityAction;
  description: string;
  details?: ActivityDetails;
  metadata?: Record<string, any>;
}

export interface ActivityLogFilter {
  userId?: string;
  category?: ActivityCategory[];
  action?: ActivityAction[];
  dateRange?: "1h" | "24h" | "7d" | "30d" | "all";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ActivityLogResponse {
  id: string;
  userId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  category: ActivityCategory;
  action: ActivityAction;
  description: string;
  details?: ActivityDetails;
  metadata?: Record<string, any>;
  timestamp: Date;
}
