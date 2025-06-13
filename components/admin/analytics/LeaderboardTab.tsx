"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Trophy,
  BarChart,
  Users,
  ChevronRight,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type TopConverter = {
  userId?: string;
  churchId?: string;
  name: string;
  email?: string;
  churchName?: string | null;
  invitesSent?: number;
  invitesScanned: number;
  invitesCompleted?: number;
  conversionRate: number;
  totalScans?: number;
  totalCompleted?: number;
};

type TopScanner = {
  userId?: string;
  churchId?: string;
  name: string;
  email?: string;
  churchName?: string | null;
  invitesScanned: number;
  totalScans?: number;
};

export default function LeaderboardTab() {
  const [view, setView] = useState<"users" | "churches">("users");
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<{
    topConverters: TopConverter[];
    topScanners: TopScanner[];
  }>({
    topConverters: [],
    topScanners: [],
  });

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/analytics/leaderboard?view=${view}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [view]);

  return (
    <div className="space-y-6">
      <Tabs
        value={view}
        onValueChange={(v) => setView(v as "users" | "churches")}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              User View
            </TabsTrigger>
            <TabsTrigger value="churches" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Church View
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            Showing top performers across the platform
          </div>
        </div>

        {/* User View */}
        <TabsContent value="users" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Converters */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <CardTitle>Top Conversion Rate</CardTitle>
                  </div>
                  <CardDescription>
                    Users with the highest invitation conversion rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardData.topConverters.length ? (
                    <div className="space-y-6">
                      {leaderboardData.topConverters.map((user, index) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold
                              ${index === 0 ? "bg-amber-500" : ""}
                              ${index === 1 ? "bg-slate-400" : ""}
                              ${index === 2 ? "bg-amber-700" : ""}
                            `}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                              {user.churchName && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {user.churchName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {user.conversionRate}% converted
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {user.invitesCompleted} of {user.invitesScanned}{" "}
                              invites
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No conversion data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Scanners */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-500" />
                    <CardTitle>Most Invite Scans</CardTitle>
                  </div>
                  <CardDescription>
                    Users with the highest number of invite QR scans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardData.topScanners.length ? (
                    <div className="space-y-6">
                      {leaderboardData.topScanners.map((user, index) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold
                              ${index === 0 ? "bg-blue-500" : ""}
                              ${index === 1 ? "bg-blue-400" : ""}
                              ${index === 2 ? "bg-blue-300" : ""}
                            `}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                              {user.churchName && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {user.churchName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {user.invitesScanned} scans
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No scan data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Church View */}
        <TabsContent value="churches" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Church Converters */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <CardTitle>Top Conversion Rate</CardTitle>
                  </div>
                  <CardDescription>
                    Churches with the highest invitation conversion rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardData.topConverters.length ? (
                    <div className="space-y-6">
                      {leaderboardData.topConverters.map((church, index) => (
                        <div
                          key={church.churchId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold
                              ${index === 0 ? "bg-amber-500" : ""}
                              ${index === 1 ? "bg-slate-400" : ""}
                              ${index === 2 ? "bg-amber-700" : ""}
                            `}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">
                                {church.churchName}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {church.conversionRate}% converted
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {church.totalCompleted} of {church.totalScans}{" "}
                              invites
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No church conversion data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Church Scanners */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-500" />
                    <CardTitle>Most Invite Scans</CardTitle>
                  </div>
                  <CardDescription>
                    Churches with the highest number of invite QR scans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardData.topScanners.length ? (
                    <div className="space-y-6">
                      {leaderboardData.topScanners.map((church, index) => (
                        <div
                          key={church.churchId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold
                              ${index === 0 ? "bg-blue-500" : ""}
                              ${index === 1 ? "bg-blue-400" : ""}
                              ${index === 2 ? "bg-blue-300" : ""}
                            `}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">
                                {church.churchName}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {church.totalScans} scans
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No church scan data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
