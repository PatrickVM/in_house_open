import { db } from "@/lib/db";

export async function cleanupExpiredInvitations() {
  try {
    const now = new Date();

    // Update expired church invitations
    const expiredInvitations = await db.churchInvitation.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(
      `Updated ${expiredInvitations.count} expired church invitations`
    );

    return {
      success: true,
      expiredInvitations: expiredInvitations.count,
    };
  } catch (error) {
    console.error("Error cleaning up expired invitations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function to get invitation analytics
export async function getInvitationStats() {
  try {
    const stats = await db.churchInvitation.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const totalInvitations = await db.churchInvitation.count();

    const statusCounts = stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: totalInvitations,
      pending: statusCounts.PENDING || 0,
      claimed: statusCounts.CLAIMED || 0,
      expired: statusCounts.EXPIRED || 0,
      cancelled: statusCounts.CANCELLED || 0,
    };
  } catch (error) {
    console.error("Error getting invitation stats:", error);
    throw error;
  }
}
