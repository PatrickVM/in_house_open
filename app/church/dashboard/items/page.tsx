import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Plus, MapPin, Calendar, User, Edit, Eye } from "lucide-react";

interface ChurchItemsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChurchItemsPage({
  searchParams,
}: ChurchItemsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get the church associated with this user
  const church = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
  });

  if (!church) {
    redirect("/church/dashboard");
  }

  // Get filter parameters
  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status as string;
  const moderationFilter = resolvedSearchParams.moderation as string;

  // Build where clause for filtering
  const whereClause: any = {
    churchId: church.id,
  };

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter;
  }

  if (moderationFilter && moderationFilter !== "all") {
    whereClause.moderationStatus = moderationFilter;
  }

  // Get church items with claimer information
  const items = await db.item.findMany({
    where: whereClause,
    include: {
      claimer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate statistics
  const stats = {
    total: items.length,
    available: items.filter((item) => item.status === "AVAILABLE").length,
    claimed: items.filter((item) => item.status === "CLAIMED").length,
    completed: items.filter((item) => item.status === "COMPLETED").length,
    approved: items.filter((item) => item.moderationStatus === "APPROVED")
      .length,
    pending: items.filter((item) => item.moderationStatus === "PENDING").length,
    rejected: items.filter((item) => item.moderationStatus === "REJECTED")
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Items</h1>
          <p className="text-muted-foreground">
            Manage all items posted by {church.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/church/dashboard/items/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.available}
            </div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">
              {stats.claimed}
            </div>
            <p className="text-xs text-muted-foreground">Claimed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Status</label>
              <div className="flex gap-2">
                <Link href="/church/dashboard/items">
                  <Button
                    variant={
                      !statusFilter || statusFilter === "all"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    All
                  </Button>
                </Link>
                <Link href="/church/dashboard/items?status=AVAILABLE">
                  <Button
                    variant={
                      statusFilter === "AVAILABLE" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Available
                  </Button>
                </Link>
                <Link href="/church/dashboard/items?status=CLAIMED">
                  <Button
                    variant={statusFilter === "CLAIMED" ? "default" : "outline"}
                    size="sm"
                  >
                    Claimed
                  </Button>
                </Link>
                <Link href="/church/dashboard/items?status=COMPLETED">
                  <Button
                    variant={
                      statusFilter === "COMPLETED" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Completed
                  </Button>
                </Link>
              </div>
            </div>

            {/* Moderation Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Moderation Status</label>
              <div className="flex gap-2">
                <Link href="/church/dashboard/items">
                  <Button
                    variant={
                      !moderationFilter || moderationFilter === "all"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    All
                  </Button>
                </Link>
                <Link href="/church/dashboard/items?moderation=APPROVED">
                  <Button
                    variant={
                      moderationFilter === "APPROVED" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Approved
                  </Button>
                </Link>
                <Link href="/church/dashboard/items?moderation=PENDING">
                  <Button
                    variant={
                      moderationFilter === "PENDING" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Pending
                  </Button>
                </Link>
                <Link href="/church/dashboard/items?moderation=REJECTED">
                  <Button
                    variant={
                      moderationFilter === "REJECTED" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Rejected
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Items Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {statusFilter || moderationFilter
                ? "No items match your current filters."
                : "You haven't posted any items yet."}
            </p>
            <Button asChild>
              <Link href="/church/dashboard/items/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "AVAILABLE"
                            ? "text-green-600 border-green-200"
                            : item.status === "CLAIMED"
                            ? "text-amber-600 border-amber-200"
                            : "text-blue-600 border-blue-200"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          item.moderationStatus === "APPROVED"
                            ? "text-green-600 border-green-200"
                            : item.moderationStatus === "PENDING"
                            ? "text-yellow-600 border-yellow-200"
                            : "text-red-600 border-red-200"
                        }
                      >
                        {item.moderationStatus}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {item.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.city}, {item.state}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.createdAt.toLocaleDateString()}
                      </div>
                      {item.claimer && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Claimed by {item.claimer.firstName}{" "}
                          {item.claimer.lastName}
                        </div>
                      )}
                    </div>

                    {item.moderationStatus === "REJECTED" &&
                      item.moderationNotes && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong>{" "}
                            {item.moderationNotes}
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/items/${item.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {item.moderationStatus !== "REJECTED" && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/church/dashboard/items/${item.id}/edit`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
