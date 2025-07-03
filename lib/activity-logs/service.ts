import {
  ActivityLogData,
  WalkthroughActivityDetails,
  InvitationActivityDetails,
  ChurchActivityDetails,
  ContentActivityDetails,
  UserActivityDetails,
  AdminActivityDetails,
  MemberRequestActivityDetails,
} from "./types";
import { createActivityLog } from "./db";

export class ActivityLogService {
  /**
   * Log walkthrough completion
   */
  static async logWalkthroughCompletion(
    userId: string,
    userRole: "USER" | "CHURCH",
    userName: string,
    userEmail: string,
    stepCount: number,
    completionTime: number,
    version: string
  ): Promise<void> {
    const description = `${userName} completed ${userRole} walkthrough (${stepCount} steps, ${this.formatTime(completionTime)})`;

    const details: WalkthroughActivityDetails = {
      role: userRole,
      stepCount,
      completionTime,
      version,
    };

    return this.logActivity({
      userId,
      userRole,
      userName,
      userEmail,
      category: "walkthrough",
      action: "completed_walkthrough",
      description,
      details,
    });
  }

  /**
   * Log walkthrough start
   */
  static async logWalkthroughStart(
    userId: string,
    userRole: "USER" | "CHURCH",
    userName: string,
    userEmail: string,
    version: string
  ): Promise<void> {
    const description = `${userName} started ${userRole} walkthrough`;

    const details: WalkthroughActivityDetails = {
      role: userRole,
      stepCount: 0,
      completionTime: 0,
      version,
    };

    return this.logActivity({
      userId,
      userRole,
      userName,
      userEmail,
      category: "walkthrough",
      action: "started_walkthrough",
      description,
      details,
    });
  }

  /**
   * Log invitation sent
   */
  static async logInvitationSent(
    userId: string,
    userRole: string,
    userName: string,
    userEmail: string,
    recipientEmail: string,
    invitationType: "church" | "user",
    invitationId?: string
  ): Promise<void> {
    const description = `${userName} sent ${invitationType} invitation to ${recipientEmail}`;

    const details: InvitationActivityDetails = {
      invitationType,
      recipientEmail,
      invitationId,
    };

    return this.logActivity({
      userId,
      userRole,
      userName,
      userEmail,
      category: "invitation",
      action: "sent_invitation",
      description,
      details,
    });
  }

  /**
   * Log church application submitted
   */
  static async logChurchApplicationSubmitted(
    userId: string,
    userName: string,
    userEmail: string,
    churchName: string,
    applicationId: string
  ): Promise<void> {
    const description = `${userName} submitted church application for ${churchName}`;

    const details: ChurchActivityDetails = {
      churchId: "",
      churchName,
      applicationId,
    };

    return this.logActivity({
      userId,
      userRole: "CHURCH",
      userName,
      userEmail,
      category: "church",
      action: "church_application_submitted",
      description,
      details,
    });
  }

  /**
   * Log content posted
   */
  static async logContentPosted(
    userId: string,
    userRole: string,
    userName: string,
    userEmail: string,
    contentType: "message" | "item",
    contentId: string,
    contentTitle: string
  ): Promise<void> {
    const description = `${userName} posted ${contentType}: ${contentTitle}`;

    const details: ContentActivityDetails = {
      contentType,
      contentId,
      contentTitle,
    };

    return this.logActivity({
      userId,
      userRole,
      userName,
      userEmail,
      category: "content",
      action: contentType === "message" ? "message_posted" : "item_posted",
      description,
      details,
    });
  }

  /**
   * Log user registration
   */
  static async logUserRegistration(
    userId: string,
    userName: string,
    userEmail: string,
    registrationSource?: string
  ): Promise<void> {
    const description = `${userName} registered on the platform`;

    const details: UserActivityDetails = {
      registrationSource,
    };

    return this.logActivity({
      userId,
      userRole: "USER",
      userName,
      userEmail,
      category: "user",
      action: "user_registered",
      description,
      details,
    });
  }

  /**
   * Log member request cancellation
   */
  static async logMemberRequestCancellation(
    userId: string,
    userName: string,
    userEmail: string,
    itemId: string,
    itemTitle: string,
    itemCategory: string,
    churchId: string,
    churchName: string,
    originalRequestDate: Date,
    memberNotes?: string
  ): Promise<void> {
    const requestDuration = Math.floor(
      (Date.now() - originalRequestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const description = `${userName} cancelled request for "${itemTitle}" (active for ${requestDuration} day${requestDuration !== 1 ? "s" : ""})`;

    const details: MemberRequestActivityDetails = {
      itemId,
      itemTitle,
      itemCategory,
      churchId,
      churchName,
      requestDuration,
      memberNotes: memberNotes || undefined,
      originalRequestDate: originalRequestDate.toISOString(),
      expirationDate: undefined, // Not needed for cancellation
    };

    return this.logActivity({
      userId,
      userRole: "USER",
      userName,
      userEmail,
      category: "member_requests",
      action: "member_request_cancelled",
      description,
      details,
    });
  }

  /**
   * Core activity logging method - now uses direct database access
   */
  private static async logActivity(data: ActivityLogData): Promise<void> {
    try {
      const result = await createActivityLog(data);

      if (!result.success) {
        throw new Error(result.error || "Failed to log activity");
      }

      // Optional: Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log("Activity logged:", data);
      }
    } catch (error) {
      console.error("Activity logging failed:", error);
      // Don't throw error to avoid breaking the main application flow
    }
  }

  /**
   * Format time duration in human-readable format
   */
  private static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Get date range for filtering
   */
  static getDateRange(range: "1h" | "24h" | "7d" | "30d" | "all"): {
    startDate?: Date;
    endDate?: Date;
  } {
    const now = new Date();

    switch (range) {
      case "1h":
        return {
          startDate: new Date(now.getTime() - 60 * 60 * 1000),
          endDate: now,
        };
      case "24h":
        return {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endDate: now,
        };
      case "7d":
        return {
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          endDate: now,
        };
      case "30d":
        return {
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: now,
        };
      case "all":
      default:
        return {};
    }
  }
}
