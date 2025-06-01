import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckCircle,
  Circle,
  User,
  Church,
  MapPin,
  Users,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Get full user data with church information
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      church: {
        select: {
          id: true,
          name: true,
          leadPastorName: true,
          city: true,
          state: true,
        },
      },
      verificationRequests: {
        where: {
          status: "PENDING",
        },
        include: {
          church: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate profile completion
  const profileFields = [
    user.firstName,
    user.lastName,
    user.bio,
    user.services,
    user.address,
    user.phone,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const totalFields = profileFields.length;
  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  // Check church status
  const hasChurch = user.churchMembershipStatus === "VERIFIED" && user.church;
  const hasPendingRequest = user.churchMembershipStatus === "REQUESTED";
  const wasRejected = user.churchMembershipStatus === "REJECTED";

  // Getting started checklist
  const checklistItems = [
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add your personal information and skills",
      completed: profileCompletion >= 80,
      href: "/profile/edit",
    },
    {
      id: "church",
      title: "Join a church community",
      description: "Connect with a local church",
      completed: hasChurch,
      href: "/dashboard/churches",
    },
    {
      id: "explore",
      title: "Explore the community",
      description: "Browse available items and services",
      completed: false, // This could be based on user activity
      href: "/items",
    },
  ];

  const completedChecklist = checklistItems.filter(
    (item) => item.completed
  ).length;
  const checklistProgress = Math.round(
    (completedChecklist / checklistItems.length) * 100
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user.firstName || user.email}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your community
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Getting Started Section */}
        <div className="md:col-span-2 space-y-6">
          {/* Getting Started Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Getting Started
                </CardTitle>
                <Badge variant="outline">
                  {completedChecklist}/{checklistItems.length} Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>

              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {!item.completed && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={item.href}>
                          Start
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Church Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="w-5 h-5" />
                Church Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasChurch ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{user.church?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Pastor: {user.church?.leadPastorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.church?.city}, {user.church?.state}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Member
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/church/dashboard">Church Dashboard</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/church-members">View Members</Link>
                    </Button>
                  </div>
                </div>
              ) : hasPendingRequest ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">
                      You have a pending church membership request
                    </span>
                  </div>
                  {user.verificationRequests.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Pending verification for:{" "}
                      {user.verificationRequests[0].church.name}
                    </div>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/church-status">View Status</Link>
                  </Button>
                </div>
              ) : wasRejected ? (
                <div className="space-y-4">
                  <div className="text-sm text-red-600">
                    Your recent church membership request was not approved.
                  </div>
                  <Button asChild size="sm">
                    <Link href="/dashboard/churches">
                      <Plus className="w-4 h-4 mr-1" />
                      Find Another Church
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect with a local church community to get started.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href="/dashboard/churches">
                        <Church className="w-4 h-4 mr-1" />
                        Browse Churches
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/church/apply">
                        <Plus className="w-4 h-4 mr-1" />
                        Invite Church
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {profileCompletion}% complete
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/profile/edit">Update Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/directory">
                  <Users className="w-4 h-4 mr-2" />
                  Browse Directory
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/items">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Items
                </Link>
              </Button>
              {hasChurch && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/church/dashboard/items/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Share Item
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
