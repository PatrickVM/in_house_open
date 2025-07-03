"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface CompletionInfo {
  type: "member" | "church";
  churchName: string;
  memberName?: string;
}

interface CompletedItem {
  id: string;
  title: string;
  completedAt: Date;
  completionInfo: CompletionInfo;
  churchId: string;
}

interface CompletionNotificationsProps {
  items: CompletedItem[];
  currentChurchId: string;
  userId: string;
}

export function CompletionNotifications({
  items,
  currentChurchId,
  userId,
}: CompletionNotificationsProps) {
  useEffect(() => {
    // Find recently completed items that were posted by current church but completed by others
    const recentlyCompleted = items.filter((item) => {
      // Only show for items posted by current church
      if (item.churchId !== currentChurchId) return false;

      // Only show for items completed in the last 24 hours
      const completedAt = new Date(item.completedAt);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);

      return hoursDiff <= 24;
    });

    // Show toast notifications for recently completed items
    recentlyCompleted.forEach((item) => {
      const completionMessage =
        item.completionInfo.type === "member"
          ? `"${item.title}" was completed by a member of ${item.completionInfo.churchName}`
          : `"${item.title}" was completed by ${item.completionInfo.churchName}`;

      toast.success(completionMessage, {
        duration: 5000,
        id: `completion-${item.id}`, // Prevent duplicate toasts
      });
    });
  }, [items, currentChurchId, userId]);

  return null; // This component only shows toasts, no UI
}
