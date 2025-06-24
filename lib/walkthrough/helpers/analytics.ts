import { ActivityLogService } from "@/lib/activity-logs/service";

export type WalkthroughAction = "started" | "completed" | "skipped" | "error";

export interface WalkthroughEvent {
  userId: string;
  stepId: string;
  action: WalkthroughAction;
  userRole: string;
  errorMessage?: string;
}

export async function logWalkthroughEvent(
  event: WalkthroughEvent
): Promise<void> {
  try {
    // Use API endpoint for logging
    const response = await fetch("/api/walkthrough/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stepId: event.stepId,
        action: event.action,
        errorMessage: event.errorMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Walkthrough Event:", event);
    }
  } catch (error) {
    console.error("Analytics logging failed:", error);
    // Don't throw error to avoid breaking the walkthrough flow
  }
}

export async function logWalkthroughStart(
  userId: string,
  userRole: string,
  stepId: string
): Promise<void> {
  await logWalkthroughEvent({
    userId,
    stepId,
    action: "started",
    userRole,
  });
}

export async function logWalkthroughComplete(
  userId: string,
  userRole: string,
  stepId: string
): Promise<void> {
  await logWalkthroughEvent({
    userId,
    stepId,
    action: "completed",
    userRole,
  });
}

export async function logWalkthroughSkip(
  userId: string,
  userRole: string,
  stepId: string
): Promise<void> {
  await logWalkthroughEvent({
    userId,
    stepId,
    action: "skipped",
    userRole,
  });
}

export async function logWalkthroughError(
  userId: string,
  userRole: string,
  stepId: string,
  errorMessage: string
): Promise<void> {
  await logWalkthroughEvent({
    userId,
    stepId,
    action: "error",
    userRole,
    errorMessage,
  });
}

/**
 * Log overall walkthrough completion to activity logs
 * This is called when the user completes ALL walkthrough steps
 */
export async function logWalkthroughCompletion(
  userId: string,
  userRole: "USER" | "CHURCH",
  userName: string,
  userEmail: string,
  stepCount: number,
  startTime: number, // timestamp when walkthrough started
  version: string = "v1"
): Promise<void> {
  try {
    const completionTime = Math.round((Date.now() - startTime) / 1000);

    await ActivityLogService.logWalkthroughCompletion(
      userId,
      userRole,
      userName,
      userEmail,
      stepCount,
      completionTime,
      version
    );
  } catch (error) {
    console.error(
      "Failed to log walkthrough completion to activity logs:",
      error
    );
    // Don't throw error to avoid breaking the walkthrough flow
  }
}

/**
 * Log walkthrough start to activity logs
 */
export async function logWalkthroughStartActivity(
  userId: string,
  userRole: "USER" | "CHURCH",
  userName: string,
  userEmail: string,
  version: string = "v1"
): Promise<void> {
  try {
    await ActivityLogService.logWalkthroughStart(
      userId,
      userRole,
      userName,
      userEmail,
      version
    );
  } catch (error) {
    console.error("Failed to log walkthrough start to activity logs:", error);
    // Don't throw error to avoid breaking the walkthrough flow
  }
}
