import { db } from "@/lib/db";

/**
 * Check if a user is a verified church member and eligible to invite others
 */
export async function isUserEligibleToInvite(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      churchMembershipStatus: true,
      verifiedAt: true,
    },
  });

  return !!(
    user &&
    user.churchMembershipStatus === "VERIFIED" &&
    user.verifiedAt
  );
}

/**
 * Get or create invite code for a user
 */
export async function getOrCreateInviteCode(userId: string): Promise<string> {
  // Check if user already has an invite code
  let inviteCode = await db.inviteCode.findUnique({
    where: { userId },
  });

  if (!inviteCode) {
    // Generate a unique code
    const code = generateUniqueCode();

    inviteCode = await db.inviteCode.create({
      data: {
        code,
        userId,
      },
    });
  }

  return inviteCode.code;
}

/**
 * Generate a unique invite code
 */
function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Track QR code scan
 */
export async function trackInviteCodeScan(code: string): Promise<void> {
  await db.inviteCode.update({
    where: { code },
    data: {
      scans: {
        increment: 1,
      },
      lastScannedAt: new Date(),
    },
  });

  // Update user analytics
  const inviteCode = await db.inviteCode.findUnique({
    where: { code },
    select: { userId: true },
  });

  if (inviteCode) {
    await db.invitationAnalytics.upsert({
      where: { userId: inviteCode.userId },
      update: {
        userInvitesScanned: {
          increment: 1,
        },
      },
      create: {
        userId: inviteCode.userId,
        userInvitesScanned: 1,
      },
    });
  }
}

/**
 * Track successful user registration via invite code
 */
export async function trackInviteCodeRegistration(
  code: string,
  newUserId: string
): Promise<void> {
  const inviteCode = await db.inviteCode.findUnique({
    where: { code },
    include: { user: true },
  });

  if (!inviteCode) return;

  // Set inviter relationship
  await db.user.update({
    where: { id: newUserId },
    data: {
      inviterId: inviteCode.userId,
    },
  });

  // Update analytics
  await db.invitationAnalytics.upsert({
    where: { userId: inviteCode.userId },
    update: {
      userInvitesCompleted: {
        increment: 1,
      },
    },
    create: {
      userId: inviteCode.userId,
      userInvitesCompleted: 1,
    },
  });
}

/**
 * Get invite analytics for a user
 */
export async function getUserInviteAnalytics(userId: string) {
  const analytics = await db.invitationAnalytics.findUnique({
    where: { userId },
  });

  const inviteCode = await db.inviteCode.findUnique({
    where: { userId },
    select: {
      code: true,
      scans: true,
      createdAt: true,
      lastScannedAt: true,
    },
  });

  const invitees = await db.user.findMany({
    where: { inviterId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    analytics: analytics || {
      churchInvitesSent: 0,
      userInvitesSent: 0,
      userInvitesScanned: 0,
      userInvitesCompleted: 0,
    },
    inviteCode,
    invitees,
  };
}
