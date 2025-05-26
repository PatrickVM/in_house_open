import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Eye, Calendar, MapPin, Building2, User } from "lucide-react";
import { ItemModerationDialog } from "@/components/admin/ItemModerationDialog";

interface PageProps {
  searchParams: Promise<{
    moderationStatus?: string;
    page?: string;
  }>;
}

export default async function ItemsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const moderationStatusFilter = resolvedSearchParams.moderationStatus;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build where clause based on filter
  const whereClause: any = {};
  if (moderationStatusFilter && moderationStatusFilter !== "all") {
    whereClause.moderationStatus = moderationStatusFilter;
  }

  // Fetch items with church and claimer information
  const [items, totalItems] = await Promise.all([
    db.item.findMany({
      where: whereClause,
      include: {
        church: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
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
      orderBy: [
        { moderationStatus: "asc" }, // Pending first
        { createdAt: "desc" },
      ],
      skip: offset,
      take: limit,
    }),
    db.item.count({ where: whereClause }),
  ]);

  // Get counts for filter badges
  const [approvedCount, pendingCount, rejectedCount] = await Promise.all([
    db.item.count({ where: { moderationStatus: "APPROVED" } }),
    db.item.count({ where: { moderationStatus: "PENDING" } }),
    db.item.count({ where: { moderationStatus: "REJECTED" } }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Items Management</h1>
          <p className="text-gray-300">
            Moderate and manage all items across churches
          </p>
        </div>
        <div className="text-sm text-gray-500">{totalItems} items</div>
      </div>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Filter by Moderation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/items">
              <Button
                variant={
                  !moderationStatusFilter || moderationStatusFilter === "all"
                    ? "default"
                    : "outline"
                }
                size="sm"
              >
                All Items ({approvedCount + pendingCount + rejectedCount})
              </Button>
            </Link>
            <Link href="/admin/items?moderationStatus=APPROVED">
              <Button
                variant={
                  moderationStatusFilter === "APPROVED" ? "default" : "outline"
                }
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Approved ({approvedCount})
              </Button>
            </Link>
            <Link href="/admin/items?moderationStatus=PENDING">
              <Button
                variant={
                  moderationStatusFilter === "PENDING" ? "default" : "outline"
                }
                size="sm"
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                Pending ({pendingCount})
              </Button>
            </Link>
            <Link href="/admin/items?moderationStatus=REJECTED">
              <Button
                variant={
                  moderationStatusFilter === "REJECTED" ? "default" : "outline"
                }
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Rejected ({rejectedCount})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className={
                            item.moderationStatus === "PENDING"
                              ? "text-amber-600 border-amber-200 bg-amber-50"
                              : item.moderationStatus === "APPROVED"
                              ? "text-green-600 border-green-200 bg-green-50"
                              : "text-red-600 border-red-200 bg-red-50"
                          }
                        >
                          {item.moderationStatus}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "AVAILABLE"
                              ? "text-blue-600 border-blue-200 bg-blue-50"
                              : item.status === "CLAIMED"
                              ? "text-purple-600 border-purple-200 bg-purple-50"
                              : "text-gray-600 border-gray-200 bg-gray-50"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300 mb-3">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{item.church.name}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>
                          {item.church.city}, {item.church.state}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Listed {item.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300">
                      <p className="mb-2">
                        <strong>Category:</strong> {item.category}
                      </p>
                      {item.description && (
                        <p className="mb-2">
                          <strong>Description:</strong>{" "}
                          {item.description.substring(0, 100)}
                          {item.description.length > 100 && "..."}
                        </p>
                      )}
                      {item.claimer && (
                        <p className="mb-2">
                          <strong>Claimed by:</strong> {item.claimer.firstName}{" "}
                          {item.claimer.lastName}
                          {item.claimedAt && (
                            <span className="text-gray-500 ml-2">
                              on {item.claimedAt.toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      )}
                      {item.moderationNotes && (
                        <p className="mb-2">
                          <strong>Moderation Notes:</strong>{" "}
                          {item.moderationNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ml-6">
                    <ItemModerationDialog item={item} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No items found
              </h3>
              <p className="text-gray-300">
                {moderationStatusFilter && moderationStatusFilter !== "all"
                  ? `No items with ${moderationStatusFilter.toLowerCase()} status.`
                  : "No items have been listed yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Showing {offset + 1} to {Math.min(offset + limit, totalItems)}{" "}
                of {totalItems} items
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/items?${new URLSearchParams({
                      ...(moderationStatusFilter && {
                        moderationStatus: moderationStatusFilter,
                      }),
                      page: (page - 1).toString(),
                    }).toString()}`}
                  >
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                <span className="flex items-center px-3 py-1 text-sm">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/admin/items?${new URLSearchParams({
                      ...(moderationStatusFilter && {
                        moderationStatus: moderationStatusFilter,
                      }),
                      page: (page + 1).toString(),
                    }).toString()}`}
                  >
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
