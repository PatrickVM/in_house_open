import { authOptions } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Settings,
  User,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UserActions from "./UserActions";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  // Get user details with related data
  const user = await db.user.findUnique({
    where: { id },
    include: {
      claimedItems: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          claimedAt: true,
        },
        orderBy: {
          claimedAt: "desc",
        },
        take: 10,
      },
      ledChurch: {
        select: {
          id: true,
          name: true,
          applicationStatus: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calculate profile completion using standardized utility
  const { completionPercentage, missingFields } =
    calculateProfileCompletion(user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email}
          </h1>
          <p className="text-muted-foreground">User Profile & Management</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              user.role === "ADMIN"
                ? "text-purple-600 border-purple-200 bg-purple-50"
                : user.role === "CHURCH"
                ? "text-blue-600 border-blue-200 bg-blue-50"
                : "text-gray-600 border-gray-200 bg-gray-50"
            }
          >
            {user.role}
          </Badge>
          <Badge
            variant="outline"
            className={
              user.isActive
                ? "text-green-600 border-green-200 bg-green-50"
                : "text-red-600 border-red-200 bg-red-50"
            }
          >
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <p className="text-foreground">
                    {user.firstName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <p className="text-foreground">
                    {user.lastName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Bio
                </label>
                <p className="text-foreground mt-1">
                  {user.bio || "No bio provided"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Services Offered
                </label>
                <p className="text-foreground mt-1">
                  {user.services || "No services listed"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Address
                  </label>
                  <p className="text-foreground">
                    {user.address || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    City
                  </label>
                  <p className="text-foreground">
                    {user.city || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    State
                  </label>
                  <p className="text-foreground">
                    {user.state || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ZIP Code
                  </label>
                  <p className="text-foreground">
                    {user.zipCode || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Church Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Church Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Church Name
                  </label>
                  <p className="text-foreground">
                    {user.churchName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Church Website
                  </label>
                  <p className="text-foreground">
                    {user.churchWebsite ? (
                      <a
                        href={user.churchWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {user.churchWebsite}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>

              {user.ledChurch && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Church Leadership
                  </h4>
                  <p className="text-blue-800 text-sm">
                    This user is the lead contact for{" "}
                    <Link
                      href={`/admin/churches/${user.ledChurch.id}`}
                      className="font-medium underline"
                    >
                      {user.ledChurch.name}
                    </Link>
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    Application Status: {user.ledChurch.applicationStatus}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.claimedItems.length > 0 ? (
                <div className="space-y-3">
                  {user.claimedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Claimed on{" "}
                          {item.claimedAt
                            ? new Date(item.claimedAt).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "COMPLETED"
                            ? "text-green-600 border-green-200 bg-green-50"
                            : item.status === "CLAIMED"
                            ? "text-blue-600 border-blue-200 bg-blue-50"
                            : "text-gray-600 border-gray-200 bg-gray-50"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Profile Completion
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {user.claimedItems.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Items Claimed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserActions user={user} />
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-foreground">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-foreground">
                  {new Date(user.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <p className="text-foreground font-mono text-sm">{user.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
