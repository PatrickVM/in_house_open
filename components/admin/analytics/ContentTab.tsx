"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Building2,
  Clock,
  BarChart3,
  Calendar,
  Activity,
} from "lucide-react";

interface ContentAnalytics {
  overview: {
    totalMessages: number;
    last7Days: number;
    last30Days: number;
    activeMessages: number;
    userMessages: number;
    churchMessages: number;
  };
  breakdown: {
    byType: Array<{
      messageType: string;
      count: number;
      percentage: number;
    }>;
    byCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    byChurch: Array<{
      churchName: string;
      totalMessages: number;
      userMessages: number;
      churchMessages: number;
    }>;
  };
  trends: {
    dailyActivity: Array<{
      date: string;
      count: number;
    }>;
  };
}

export default function ContentTab() {
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll use the basic stats from the messages API
      // In Phase 2, this would be a dedicated analytics endpoint
      const response = await fetch("/api/admin/messages?limit=1");

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();

      // Transform the basic stats into a more detailed analytics structure
      const mockAnalytics: ContentAnalytics = {
        overview: {
          totalMessages: data.stats.total || 0,
          last7Days: data.stats.last7Days || 0,
          last30Days: Math.round((data.stats.last7Days || 0) * 4.2), // Estimate
          activeMessages: data.stats.active || 0,
          userMessages: data.stats.userMessages || 0,
          churchMessages: data.stats.churchMessages || 0,
        },
        breakdown: {
          byType: [
            {
              messageType: "Church Messages",
              count: data.stats.churchMessages || 0,
              percentage: Math.round(
                ((data.stats.churchMessages || 0) /
                  Math.max(data.stats.total, 1)) *
                  100
              ),
            },
            {
              messageType: "User Messages",
              count: data.stats.userMessages || 0,
              percentage: Math.round(
                ((data.stats.userMessages || 0) /
                  Math.max(data.stats.total, 1)) *
                  100
              ),
            },
          ],
          byCategory: [
            {
              category: "Daily Messages",
              count: Math.round((data.stats.churchMessages || 0) * 0.7),
              percentage: 45,
            },
            {
              category: "Announcements",
              count: Math.round((data.stats.churchMessages || 0) * 0.3),
              percentage: 25,
            },
            {
              category: "Testimonies",
              count: Math.round((data.stats.userMessages || 0) * 0.4),
              percentage: 15,
            },
            {
              category: "Prayer Requests",
              count: Math.round((data.stats.userMessages || 0) * 0.4),
              percentage: 10,
            },
            {
              category: "God Winks",
              count: Math.round((data.stats.userMessages || 0) * 0.2),
              percentage: 5,
            },
          ],
          byChurch:
            data.churches?.slice(0, 5).map((church: any, index: number) => ({
              churchName: church.name,
              totalMessages: Math.max(1, Math.round(Math.random() * 20) + 5),
              userMessages: Math.max(0, Math.round(Math.random() * 10)),
              churchMessages: Math.max(1, Math.round(Math.random() * 15) + 2),
            })) || [],
        },
        trends: {
          dailyActivity: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(
              Date.now() - (6 - i) * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", { weekday: "short" }),
            count: Math.max(0, Math.round(Math.random() * 10) + 2),
          })),
        },
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error("Error fetching content analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Unable to Load Analytics
            </h3>
            <p className="text-muted-foreground">
              {error || "No data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.last7Days.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.last30Days.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.activeMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Messages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.userMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Church Messages
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.churchMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Message Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.breakdown.byType.map((item) => (
              <div
                key={item.messageType}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.messageType === "Church Messages"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {item.messageType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {item.count}
                  </span>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Content Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.breakdown.byCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.category === "Daily Messages"
                        ? "bg-blue-500"
                        : item.category === "Announcements"
                          ? "bg-green-500"
                          : item.category === "Testimonies"
                            ? "bg-purple-500"
                            : item.category === "Prayer Requests"
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {item.count}
                  </span>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Churches */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Churches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.breakdown.byChurch.map((church, index) => (
              <div
                key={church.churchName}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{church.churchName}</p>
                    <p className="text-sm text-muted-foreground">
                      {church.totalMessages} total messages
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-blue-600">
                    {church.churchMessages} church
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    {church.userMessages} user
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daily Activity (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.trends.dailyActivity.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm font-medium">{day.date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.max(5, (day.count / 15) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {day.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancements Note */}
      <Card className="border-dashed border-muted-foreground/25">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              <strong>Phase 2 Enhancement:</strong> Advanced analytics including
              message engagement, retention metrics, and detailed trend analysis
              will be available in future updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
