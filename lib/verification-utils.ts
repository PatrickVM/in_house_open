import { db } from "@/lib/db";

/**
 * Check if a user is eligible to verify other members
 * Must be a verified church member for at least 7 days
 */
export async function isUserEligibleToVerify(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      churchMembershipStatus: true,
      verifiedAt: true,
    },
  });

  if (!user || user.churchMembershipStatus !== "VERIFIED" || !user.verifiedAt) {
    return false;
  }

  // Check if user has been verified for at least 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return user.verifiedAt <= sevenDaysAgo;
}

/**
 * Get verification requests for a specific member using rotation algorithm
 * Each member sees a random subset of requests to distribute verification load
 */
export async function getVerificationRequestsForMember(
  userId: string,
  churchId: string
): Promise<any[]> {
  // Get all pending requests for the church
  const allRequests = await db.churchVerificationRequest.findMany({
    where: {
      churchId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
          services: true,
          city: true,
          state: true,
        },
      },
      church: {
        select: {
          name: true,
          minVerificationsRequired: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (allRequests.length === 0) {
    return [];
  }

  // Get all eligible church members for rotation calculation
  const eligibleMembers = await db.user.findMany({
    where: {
      churchId,
      churchMembershipStatus: "VERIFIED",
      verifiedAt: {
        lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    },
    select: {
      id: true,
    },
  });

  if (eligibleMembers.length === 0) {
    return [];
  }

  // Filter out requests that this member has already verified using the new MemberVerification table
  const memberVerifications = await db.memberVerification.findMany({
    where: {
      verifierId: userId,
      request: {
        churchId,
      },
    },
    select: {
      request: {
        select: {
          userId: true,
        },
      },
    },
  });

  const verifiedUserIds = new Set(
    memberVerifications.map((v) => v.request.userId)
  );
  const availableRequests = allRequests.filter(
    (request) => !verifiedUserIds.has(request.userId)
  );

  // Implement random rotation - each member gets a random subset
  const requestsPerMember = Math.max(
    1,
    Math.ceil(availableRequests.length / eligibleMembers.length)
  );

  // Create a deterministic but random-seeming distribution based on user ID
  const userHash = hashString(userId);
  const startIndex = userHash % availableRequests.length;

  // Get requests in a circular manner
  const memberRequests = [];
  for (
    let i = 0;
    i < Math.min(requestsPerMember, availableRequests.length);
    i++
  ) {
    const index = (startIndex + i) % availableRequests.length;
    memberRequests.push(availableRequests[index]);
  }

  return memberRequests;
}

/**
 * Calculate current verification progress for a request
 */
export async function getVerificationProgress(
  userId: string,
  churchId: string
): Promise<{
  currentVerifications: number;
  requiredVerifications: number;
  verifierNames: string[];
}> {
  // First, get the original verification request
  const originalRequest = await db.churchVerificationRequest.findFirst({
    where: {
      userId,
      churchId,
    },
  });

  if (!originalRequest) {
    return {
      currentVerifications: 0,
      requiredVerifications: 3,
      verifierNames: [],
    };
  }

  // Get approved member verifications for this request
  const approvedVerifications = await db.memberVerification.findMany({
    where: {
      requestId: originalRequest.id,
      action: "APPROVED",
    },
    include: {
      verifier: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const church = await db.church.findUnique({
    where: { id: churchId },
    select: { minVerificationsRequired: true },
  });

  const verifierNames = approvedVerifications.map((v) => {
    const verifier = v.verifier;
    return verifier.firstName && verifier.lastName
      ? `${verifier.firstName} ${verifier.lastName}`
      : verifier.email;
  });

  return {
    currentVerifications: approvedVerifications.length,
    requiredVerifications: church?.minVerificationsRequired || 3,
    verifierNames,
  };
}

/**
 * Check if a user should be auto-approved based on current verifications
 */
export async function shouldAutoApproveUser(
  userId: string,
  churchId: string
): Promise<boolean> {
  const progress = await getVerificationProgress(userId, churchId);
  return progress.currentVerifications >= progress.requiredVerifications;
}

/**
 * Update user verification status when they become verified
 */
export async function setUserVerifiedAt(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      verifiedAt: new Date(),
    },
  });
}

/**
 * Simple hash function for deterministic randomization
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
