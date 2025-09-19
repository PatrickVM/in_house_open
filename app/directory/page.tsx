import { authOptions } from "@/auth";
import DirectorySearch from "@/components/directory/DirectorySearch";
import PingNotificationBanner from "@/components/ping/PingNotificationBanner";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DirectoryPage() {
  // Get session to check if user is authenticated
  const session = (await getServerSession(authOptions as any)) as any;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login?callbackUrl=/directory");
  }

  // Get current user's church information
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      churchId: true,
      churchMembershipStatus: true,
      church: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  // Check if user is verified with a church
  const isVerifiedChurchMember = Boolean(
    currentUser.churchMembershipStatus === "VERIFIED" && currentUser.churchId
  );

  let users: any[] = [];
  let churchName = "";

  if (isVerifiedChurchMember) {
    churchName = currentUser.church?.name || "";

    // Get users from the same church with completed profiles
    users = await db.user.findMany({
      where: {
        // Same church as current user
        churchId: currentUser.churchId,
        // Verified church members only
        churchMembershipStatus: "VERIFIED",
        // At least one of these fields must be defined
        OR: [
          { firstName: { not: null } },
          { lastName: { not: null } },
          { bio: { not: null } },
          { services: { not: null } },
        ],
        // Exclude the current user
        id: { not: session.user.id as string },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        services: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        verifiedAt: true,
      },
    });
  }

  // Filter to users with at least 3 completed fields
  const completedUsers = users.filter((user) => {
    const fields = [user.firstName, user.lastName, user.bio, user.services];

    const completedFieldsCount = fields.filter(Boolean).length;
    return completedFieldsCount >= 3;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {isVerifiedChurchMember
              ? `${churchName} Directory`
              : "Community Directory"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isVerifiedChurchMember
              ? `Connect with verified members of ${churchName}`
              : "Connect with people in your community"}
          </p>
        </div>
      </div>

      {/* Show ping notification banner for authenticated users */}
      {isVerifiedChurchMember && <PingNotificationBanner />}

      <DirectorySearch
        initialUsers={completedUsers}
        churchName={churchName}
        isVerifiedChurchMember={isVerifiedChurchMember}
      />
    </div>
  );
}
