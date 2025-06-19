import { authOptions } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  CheckCircle,
  Circle,
  Clock,
  MessageSquare,
  Package,
  Plus,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChurchDashboard() {
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
    redirect("/church/register");
  }

  // Get church items statistics
  const [
    totalItems,
    availableItems,
    claimedItems,
    completedItems,
    pendingItems,
  ] = await Promise.all([
    db.item.count({
      where: { churchId: church.id },
    }),
    db.item.count({
      where: { churchId: church.id, status: "AVAILABLE" },
    }),
    db.item.count({
      where: { churchId: church.id, status: "CLAIMED" },
    }),
    db.item.count({
      where: { churchId: church.id, status: "COMPLETED" },
    }),
    db.item.count({
      where: { churchId: church.id, moderationStatus: "PENDING" },
    }),
  ]);

  // Get recent items
  const recentItems = await db.item.findMany({
    where: { churchId: church.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });

  const stats = {
    totalItems,
    availableItems,
    claimedItems,
    completedItems,
    pendingItems,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your church's community impact
        </p>
      </div>

      {/* Stats Grid - Mobile: 2 cols, Tablet: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          trend="All time"
          trendColor="text-blue-600"
        />
        <StatCard
          title="Available"
          value={stats.availableItems}
          icon={Circle}
          trend="Ready to be claimed"
          trendColor="text-blue-600"
        />
        <StatCard
          title="Items Claimed"
          value={stats.claimedItems}
          icon={Users}
          trend="Being helped"
          trendColor="text-amber-600"
        />
        <StatCard
          title="Completed"
          value={stats.completedItems}
          icon={CheckCircle}
          trend="Community impact"
          trendColor="text-green-600"
        />
      </div>

      {/* Item Status Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <Package className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Item Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approved & Available</span>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                {stats.availableItems}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Claimed</span>
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200"
              >
                {stats.claimedItems}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed</span>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                {stats.completedItems}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Approval</span>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                {stats.pendingItems}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Recent Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start md:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} • {item.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
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
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    No items yet
                  </p>
                  <Button asChild size="sm">
                    <Link href="/church/dashboard/items/new">
                      Create your first item
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/church/dashboard/items/new"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
            >
              <Plus className="w-6 h-6 md:w-8 md:h-8 text-green-600 mb-2 group-hover:scale-105 transition-transform" />
              <h3 className="font-medium text-sm md:text-base">Add New Item</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Share resources with your community
              </p>
            </Link>
            <Link
              href="/church/dashboard/items"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
            >
              <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mb-2 group-hover:scale-105 transition-transform" />
              <h3 className="font-medium text-sm md:text-base">Manage Items</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {stats.totalItems} items to manage
              </p>
            </Link>
            <Link
              href="/church/dashboard/messages"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
            >
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2 group-hover:scale-105 transition-transform" />
              <h3 className="font-medium text-sm md:text-base">
                Daily Messages
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Broadcast to your community
              </p>
            </Link>
            <Link
              href="/church/dashboard/member-posts"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
            >
              <Users className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 mb-2 group-hover:scale-105 transition-transform" />
              <h3 className="font-medium text-sm md:text-base">Member Posts</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Manage member testimonies
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendColor,
}: {
  title: string;
  value: number;
  icon: any;
  trend: string;
  trendColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-lg md:text-2xl font-bold text-foreground">
              {value}
            </p>
          </div>
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground flex-shrink-0" />
        </div>
        <div className="mt-2 md:mt-4">
          <p className={`text-xs md:text-sm ${trendColor} truncate`}>{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
