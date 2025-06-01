import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  Users,
  CheckCircle,
  Clock,
  MessageSquare,
  MapPin,
  Plus,
} from "lucide-react";

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
    include: {
      items: {
        include: {
          claimer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Church Dashboard
          </h1>
          <p className="text-muted-foreground">
            No approved church found for your account
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">Church Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have an approved church application associated with your
              account.
            </p>
            <Button asChild>
              <Link href="/church/apply">Apply for Church Status</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = {
    totalItems: church.items.length,
    availableItems: church.items.filter((item) => item.status === "AVAILABLE")
      .length,
    claimedItems: church.items.filter((item) => item.status === "CLAIMED")
      .length,
    completedItems: church.items.filter((item) => item.status === "COMPLETED")
      .length,
    recentItems: church.items.filter((item) => item.createdAt >= thirtyDaysAgo)
      .length,
    approvedItems: church.items.filter(
      (item) => item.moderationStatus === "APPROVED"
    ).length,
    pendingItems: church.items.filter(
      (item) => item.moderationStatus === "PENDING"
    ).length,
  };

  // Get recent activity
  const recentItems = church.items.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {church.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your church community
          </p>
        </div>
        <Button asChild>
          <Link href="/church/dashboard/items/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          trend={`+${stats.recentItems} this month`}
          trendColor="text-green-600"
        />
        <StatCard
          title="Available Items"
          value={stats.availableItems}
          icon={Clock}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Item Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Approved & Available
                </span>
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
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} • {item.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
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
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No items yet</p>
                  <Button asChild size="sm" className="mt-2">
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
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/church/dashboard/items/new"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Plus className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium">Add New Item</h3>
              <p className="text-sm text-muted-foreground">
                Share resources with your community
              </p>
            </a>
            <a
              href="/church/dashboard/items"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Manage Items</h3>
              <p className="text-sm text-muted-foreground">
                {stats.totalItems} items to manage
              </p>
            </a>
            <a
              href="/church/dashboard/messages"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-medium">Daily Messages</h3>
              <p className="text-sm text-muted-foreground">
                Broadcast to your community
              </p>
            </a>
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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="mt-4">
          <p className={`text-sm ${trendColor}`}>{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
