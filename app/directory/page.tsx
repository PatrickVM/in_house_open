import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, UserIcon, Church, Users } from "lucide-react";
import { authOptions } from "@/auth";
import Link from "next/link";

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
  const isVerifiedChurchMember =
    currentUser.churchMembershipStatus === "VERIFIED" && currentUser.churchId;

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

        {isVerifiedChurchMember && (
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by name or service..."
              type="search"
            />
          </div>
        )}
      </div>

      {!isVerifiedChurchMember ? (
        <div className="text-center py-12">
          <Church className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-6" />
          <h2 className="text-xl font-medium mb-4">Join a Church Community</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            To access the community directory, you need to be a verified member
            of a church. Connect with a local church to see and connect with
            other members.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/dashboard/churches">
                <Church className="w-4 h-4 mr-2" />
                Find Churches
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Users className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      ) : completedUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h2 className="mt-4 text-lg font-medium">No members found</h2>
          <p className="mt-2 text-muted-foreground">
            Be the first to complete your profile and appear in the {churchName}{" "}
            directory!
          </p>
          <Button asChild className="mt-4">
            <Link href="/profile/edit">Complete Your Profile</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              Showing {completedUsers.length} verified member
              {completedUsers.length !== 1 ? "s" : ""} from {churchName}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader className="pb-3">
                  <CardTitle>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Church className="w-3 h-3" />
                    {churchName} Member
                    {user.verifiedAt && (
                      <span className="text-xs">
                        • Verified{" "}
                        {new Date(user.verifiedAt).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.bio && (
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  )}

                  {(user.phone || user.email) && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        CONTACT
                      </p>
                      <div className="text-sm space-y-1">
                        {user.phone && <p>{user.phone}</p>}
                        <p>{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user.services && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        SERVICES & SKILLS
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {user.services
                          .split(",")
                          .map((service: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {service.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
