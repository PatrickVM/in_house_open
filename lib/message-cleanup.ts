import { db } from "@/lib/db";
import { calculateExpirationDate, shouldPublishMessage } from "@/lib/messages";

/**
 * Cleanup expired messages and publish scheduled messages
 * This should be run as a background job/cron task
 */
export async function cleanupMessages() {
  try {
    const now = new Date();

    // 1. Mark expired published messages as EXPIRED
    const expiredMessages = await db.message.updateMany({
      where: {
        status: "PUBLISHED",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`Marked ${expiredMessages.count} messages as expired`);

    // 2. Auto-publish scheduled messages whose time has come
    const messagesToPublish = await db.message.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          lte: now,
        },
      },
    });

    let publishedCount = 0;

    for (const message of messagesToPublish) {
      const publishedAt = new Date();
      const expiresAt = calculateExpirationDate(publishedAt);

      await db.message.update({
        where: { id: message.id },
        data: {
          status: "PUBLISHED",
          publishedAt,
          expiresAt,
        },
      });

      publishedCount++;
    }

    console.log(`Auto-published ${publishedCount} scheduled messages`);

    // 3. Optional: Archive old expired messages (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const archivedMessages = await db.message.updateMany({
      where: {
        status: "EXPIRED",
        expiresAt: {
          lt: thirtyDaysAgo,
        },
      },
      data: {
        status: "ARCHIVED",
      },
    });

    console.log(`Archived ${archivedMessages.count} old expired messages`);

    return {
      success: true,
      expired: expiredMessages.count,
      published: publishedCount,
      archived: archivedMessages.count,
    };
  } catch (error) {
    console.error("Error during message cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cleanup messages for a specific church
 * Useful for testing or manual cleanup
 */
export async function cleanupChurchMessages(churchId: string) {
  try {
    const now = new Date();

    // Mark expired messages for this church
    const expiredMessages = await db.message.updateMany({
      where: {
        churchId,
        status: "PUBLISHED",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // Auto-publish scheduled messages for this church
    const messagesToPublish = await db.message.findMany({
      where: {
        churchId,
        status: "SCHEDULED",
        scheduledFor: {
          lte: now,
        },
      },
    });

    let publishedCount = 0;

    for (const message of messagesToPublish) {
      const publishedAt = new Date();
      const expiresAt = calculateExpirationDate(publishedAt);

      await db.message.update({
        where: { id: message.id },
        data: {
          status: "PUBLISHED",
          publishedAt,
          expiresAt,
        },
      });

      publishedCount++;
    }

    return {
      success: true,
      expired: expiredMessages.count,
      published: publishedCount,
    };
  } catch (error) {
    console.error(
      `Error during church message cleanup for ${churchId}:`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get cleanup statistics without performing cleanup
 */
export async function getCleanupStats() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      expiredToMarkCount,
      scheduledToPublishCount,
      oldExpiredToArchiveCount,
    ] = await Promise.all([
      // Messages that should be marked as expired
      db.message.count({
        where: {
          status: "PUBLISHED",
          expiresAt: {
            lt: now,
          },
        },
      }),

      // Scheduled messages ready to be published
      db.message.count({
        where: {
          status: "SCHEDULED",
          scheduledFor: {
            lte: now,
          },
        },
      }),

      // Old expired messages that can be archived
      db.message.count({
        where: {
          status: "EXPIRED",
          expiresAt: {
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    return {
      expiredToMark: expiredToMarkCount,
      scheduledToPublish: scheduledToPublishCount,
      oldExpiredToArchive: oldExpiredToArchiveCount,
    };
  } catch (error) {
    console.error("Error getting cleanup stats:", error);
    return {
      expiredToMark: 0,
      scheduledToPublish: 0,
      oldExpiredToArchive: 0,
    };
  }
}
