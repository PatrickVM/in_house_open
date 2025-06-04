import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { calculateProfileCompletion } from "@/lib/profile-completion";
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
  AlertCircle,
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

  // Calculate profile completion using standardized utility
  const { completionPercentage } = calculateProfileCompletion(user);

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
      completed: completionPercentage >= 80,
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
      completed: hasChurch,
      href: "/directory",
    },
  ];

  const completedChecklist = checklistItems.filter(
    (item) => item.completed
  ).length;
  const checklistProgress = Math.round(
    (completedChecklist / checklistItems.length) * 100
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {user.firstName || user.email}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your community
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Getting Started Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Getting Started Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  Getting Started
                </CardTitle>
                <Badge variant="outline" className="text-xs md:text-sm">
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
                    className="flex items-start md:items-center justify-between p-3 rounded-lg border gap-3"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0 mt-0.5 md:mt-0" />
                      ) : (
                        <Circle className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0 mt-0.5 md:mt-0" />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm md:text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {!item.completed && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <Link href={item.href}>
                          <span className="hidden sm:inline">Start</span>
                          <ArrowRight className="w-4 h-4 sm:ml-1" />
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
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Church className="w-4 h-4 md:w-5 md:h-5" />
                Church Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasChurch ? (
                <div className="space-y-4">
                  <div className="flex items-start md:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm md:text-base">
                        {user.church?.name}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Pastor: {user.church?.leadPastorName}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {user.church?.city}, {user.church?.state}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/directory">
                        <MapPin className="w-4 h-4 mr-2" />
                        Browse Items
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/directory">
                        <Users className="w-4 h-4 mr-2" />
                        View Directory
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : hasPendingRequest ? (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 md:w-12 md:h-12 text-amber-500 mx-auto mb-3" />
                  <h4 className="font-medium text-sm md:text-base mb-2">
                    Verification Pending
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4">
                    Your church membership request is being reviewed
                  </p>
                  {user.verificationRequests.map((request) => (
                    <Badge
                      key={request.id}
                      variant="outline"
                      className="text-amber-600 border-amber-200"
                    >
                      Pending at {request.church.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Church className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium text-sm md:text-base mb-2">
                    Join a Church Community
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4">
                    Connect with a local church to access community resources
                  </p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/churches">
                      <Plus className="w-4 h-4 mr-2" />
                      Find Churches
                    </Link>
                  </Button>
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
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <User className="w-4 h-4 md:w-5 md:h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/profile/edit">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Link href="/directory">
                  <MapPin className="w-4 h-4 mr-2" />
                  Browse Items
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Link href="/directory">
                  <Users className="w-4 h-4 mr-2" />
                  Community Directory
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Link href="/map">
                  <MapPin className="w-4 h-4 mr-2" />
                  Explore Map
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
