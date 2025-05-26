import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Phone,
  Mail,
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { db } from "@/lib/db";

interface ChurchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChurchDetailPage({
  params,
}: ChurchDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  // Get church details directly from database
  const church = await db.church.findUnique({
    where: { id },
    include: {
      leadContact: true,
      items: {
        include: {
          claimer: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!church) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            asChild
            className="text-gray-400 hover:text-gray-200"
          >
            <Link href="/admin/churches">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Churches
            </Link>
          </Button>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Church Not Found
            </h3>
            <p className="text-gray-500 text-center">
              The requested church could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate item statistics
  const itemStats = {
    total: church.items?.length || 0,
    approved:
      church.items?.filter((item) => item.moderationStatus === "APPROVED")
        .length || 0,
    pending:
      church.items?.filter((item) => item.moderationStatus === "PENDING")
        .length || 0,
    rejected:
      church.items?.filter((item) => item.moderationStatus === "REJECTED")
        .length || 0,
    available:
      church.items?.filter((item) => item.status === "AVAILABLE").length || 0,
    claimed:
      church.items?.filter((item) => item.status === "CLAIMED").length || 0,
    completed:
      church.items?.filter((item) => item.status === "COMPLETED").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            asChild
            className="text-gray-400 hover:text-gray-200"
          >
            <Link href="/admin/churches">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Churches
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{church.name}</h1>
            <p className="text-gray-400 mt-1">Church Details & Management</p>
          </div>
        </div>
        {church.website && (
          <Button
            variant="outline"
            asChild
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <a href={church.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Church Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">
                Church Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Lead Pastor
                  </label>
                  <p className="text-gray-200">{church.leadPastorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Application Status
                  </label>
                  <Badge
                    variant="secondary"
                    className="bg-green-600 text-white"
                  >
                    {church.applicationStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400">
                  Address
                </label>
                <div className="flex items-start space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-gray-200">
                    <div>{church.address}</div>
                    <div>
                      {church.city}, {church.state} {church.zipCode}
                    </div>
                  </div>
                </div>
              </div>

              {church.latitude && church.longitude && (
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Coordinates
                  </label>
                  <p className="text-gray-200">
                    {church.latitude.toFixed(6)}, {church.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Created
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-200">
                      {new Date(church.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Last Updated
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-200">
                      {new Date(church.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Contact */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Lead Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Name
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-200">
                      {church.leadContact.firstName &&
                      church.leadContact.lastName
                        ? `${church.leadContact.firstName} ${church.leadContact.lastName}`
                        : "Name not provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Status
                  </label>
                  <Badge
                    variant="secondary"
                    className={
                      church.leadContact.isActive
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }
                  >
                    {church.leadContact.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Email
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${church.leadContact.email}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {church.leadContact.email}
                    </a>
                  </div>
                </div>
                {church.leadContact.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Phone
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a
                        href={`tel:${church.leadContact.phone}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {church.leadContact.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Item Statistics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Item Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Items</span>
                  <Badge
                    variant="secondary"
                    className="bg-gray-700 text-gray-200"
                  >
                    {itemStats.total}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Approved
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-600 text-white"
                  >
                    {itemStats.approved}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                    Pending
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-600 text-white"
                  >
                    {itemStats.pending}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <XCircle className="h-4 w-4 mr-1 text-red-500" />
                    Rejected
                  </span>
                  <Badge variant="secondary" className="bg-red-600 text-white">
                    {itemStats.rejected}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available</span>
                    <span className="text-gray-200">{itemStats.available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Claimed</span>
                    <span className="text-gray-200">{itemStats.claimed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-gray-200">{itemStats.completed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href={`/admin/items?church=${church.id}`}>
                  View All Items
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Link href={`/admin/users/${church.leadContact.id}`}>
                  View Lead Contact
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Items */}
      {church.items && church.items.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Recent Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {church.items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-200">{item.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {item.category}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={
                        item.moderationStatus === "APPROVED"
                          ? "bg-green-600 text-white"
                          : item.moderationStatus === "PENDING"
                          ? "bg-yellow-600 text-white"
                          : "bg-red-600 text-white"
                      }
                    >
                      {item.moderationStatus}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {church.items.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Link href={`/admin/items?church=${church.id}`}>
                      View All {church.items.length} Items
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
