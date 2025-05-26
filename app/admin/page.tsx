import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  FileText,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";

export default async function AdminDashboard() {
  // Get statistics for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch dashboard statistics
  const [
    totalUsers,
    totalChurches,
    totalApplications,
    totalItems,
    recentUsers,
    recentApplications,
    pendingApplications,
    approvedChurches,
    rejectedApplications,
  ] = await Promise.all([
    // Total counts
    db.user.count(),
    db.church.count({ where: { applicationStatus: "APPROVED" } }),
    db.church.count(),
    db.item.count(),

    // Recent activity (last 30 days)
    db.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.church.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),

    // Application status breakdown
    db.church.count({ where: { applicationStatus: "PENDING" } }),
    db.church.count({ where: { applicationStatus: "APPROVED" } }),
    db.church.count({ where: { applicationStatus: "REJECTED" } }),
  ]);

  // Get recent applications for activity feed
  const recentApplicationsList = await db.church.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      leadContact: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to the InHouse Network admin portal
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          trend={`+${recentUsers} this month`}
          trendColor="text-green-600"
        />
        <StatCard
          title="Active Churches"
          value={approvedChurches}
          icon={Building2}
          trend={`${totalChurches} total applications`}
          trendColor="text-blue-600"
        />
        <StatCard
          title="Pending Applications"
          value={pendingApplications}
          icon={FileText}
          trend={`+${recentApplications} this month`}
          trendColor="text-amber-600"
        />
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={Package}
          trend="All items listed"
          trendColor="text-muted-foreground"
        />
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Review</span>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-200"
                  >
                    {pendingApplications}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approved</span>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    {approvedChurches}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rejected</span>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-200"
                  >
                    {rejectedApplications}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplicationsList.length > 0 ? (
                recentApplicationsList.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{application.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {application.leadContact.firstName}{" "}
                        {application.leadContact.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          application.applicationStatus === "PENDING"
                            ? "text-amber-600 border-amber-200"
                            : application.applicationStatus === "APPROVED"
                            ? "text-green-600 border-green-200"
                            : "text-red-600 border-red-200"
                        }
                      >
                        {application.applicationStatus}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {application.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent applications
                </p>
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
              href="/admin/applications"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <FileText className="w-8 h-8 text-amber-600 mb-2" />
              <h3 className="font-medium">Review Applications</h3>
              <p className="text-sm text-muted-foreground">
                {pendingApplications} pending review
              </p>
            </a>
            <a
              href="/admin/churches"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Building2 className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Manage Churches</h3>
              <p className="text-sm text-muted-foreground">
                {approvedChurches} active churches
              </p>
            </a>
            <a
              href="/admin/users"
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium">View Users</h3>
              <p className="text-sm text-muted-foreground">
                {totalUsers} registered users
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable stat card component
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
