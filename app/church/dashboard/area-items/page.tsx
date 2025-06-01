import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, MapPin, Calendar, User, Building2, Eye } from "lucide-react";

interface AreaItemsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AreaItemsPage({
  searchParams,
}: AreaItemsPageProps) {
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
  const categoryFilter = resolvedSearchParams.category as string;

  // Build where clause for filtering
  // For now, we'll show all items in the same state as the church
  // In a real implementation, you'd use geographic distance calculations
  const whereClause: any = {
    state: church.state,
    moderationStatus: "APPROVED", // Only show approved items
    NOT: {
      churchId: church.id, // Exclude own church's items
    },
  };

  if (statusFilter && statusFilter !== "all") {
    whereClause.status = statusFilter;
  }

  if (categoryFilter && categoryFilter !== "all") {
    whereClause.category = categoryFilter;
  }

  // Get area items with church and claimer information
  const items = await db.item.findMany({
    where: whereClause,
    include: {
      church: {
        select: {
          id: true,
          name: true,
        },
      },
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
    take: 50, // Limit to 50 items for performance
  });

  // Get unique categories for filter
  const allItems = await db.item.findMany({
    where: {
      state: church.state,
      moderationStatus: "APPROVED",
      NOT: {
        churchId: church.id,
      },
    },
    select: {
      category: true,
    },
  });

  const categories = Array.from(
    new Set(allItems.map((item) => item.category))
  ).sort();

  // Calculate statistics
  const stats = {
    total: items.length,
    available: items.filter((item) => item.status === "AVAILABLE").length,
    claimed: items.filter((item) => item.status === "CLAIMED").length,
    completed: items.filter((item) => item.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Area Items</h1>
        <p className="text-muted-foreground">
          Items available in {church.city}, {church.state} and surrounding areas
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Link href="/church/dashboard/area-items">
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
                <Link href="/church/dashboard/area-items?status=AVAILABLE">
                  <Button
                    variant={
                      statusFilter === "AVAILABLE" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Available
                  </Button>
                </Link>
                <Link href="/church/dashboard/area-items?status=CLAIMED">
                  <Button
                    variant={statusFilter === "CLAIMED" ? "default" : "outline"}
                    size="sm"
                  >
                    Claimed
                  </Button>
                </Link>
                <Link href="/church/dashboard/area-items?status=COMPLETED">
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

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/church/dashboard/area-items">
                    <Button
                      variant={
                        !categoryFilter || categoryFilter === "all"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      All
                    </Button>
                  </Link>
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category}
                      href={`/church/dashboard/area-items?category=${category}`}
                    >
                      <Button
                        variant={
                          categoryFilter === category ? "default" : "outline"
                        }
                        size="sm"
                      >
                        {category}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Items Found</h3>
            <p className="text-muted-foreground text-center">
              {statusFilter || categoryFilter
                ? "No items match your current filters."
                : "No items are currently available in your area."}
            </p>
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
                        <Building2 className="w-4 h-4" />
                        {item.church.name}
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
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/items/${item.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {items.length === 50 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing first 50 items. Use filters to narrow down results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
