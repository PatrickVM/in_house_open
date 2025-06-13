"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Trophy,
  BarChart,
  Users,
  TrendingUp,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChurchMemberStats {
  userId: string;
  memberName: string;
  email: string;
  churchInvitesSent: number;
  userInvitesSent: number;
  userInvitesScanned: number;
  userInvitesCompleted: number;
  conversionRate: number;
}

interface ChurchWideStats {
  totalChurchInvitesSent: number;
  totalUserInvitesSent: number;
  totalScans: number;
  totalConversions: number;
  churchConversionRate: number;
  activeMembersCount: number;
}

interface ChurchMemberBoardProps {
  churchId: string;
}

export default function ChurchMemberBoard({
  churchId,
}: ChurchMemberBoardProps) {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<{
    topConverters: ChurchMemberStats[];
    topScanners: ChurchMemberStats[];
    churchWideStats: ChurchWideStats;
  }>({
    topConverters: [],
    topScanners: [],
    churchWideStats: {
      totalChurchInvitesSent: 0,
      totalUserInvitesSent: 0,
      totalScans: 0,
      totalConversions: 0,
      churchConversionRate: 0,
      activeMembersCount: 0,
    },
  });

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/church/analytics/leaderboard`);

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
  }, [churchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Church-Wide Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Invitations
                </p>
                <p className="text-2xl font-bold">
                  {leaderboardData.churchWideStats.totalChurchInvitesSent +
                    leaderboardData.churchWideStats.totalUserInvitesSent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Scans
                </p>
                <p className="text-2xl font-bold">
                  {leaderboardData.churchWideStats.totalScans}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Conversions
                </p>
                <p className="text-2xl font-bold">
                  {leaderboardData.churchWideStats.totalConversions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Members
                </p>
                <p className="text-2xl font-bold">
                  {leaderboardData.churchWideStats.activeMembersCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Converters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Top Conversion Rate</CardTitle>
            </div>
            <CardDescription>
              Church members with the highest invitation conversion rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboardData.topConverters.length ? (
              <div className="space-y-6">
                {leaderboardData.topConverters.map((member, index) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold
                        ${index === 0 ? "bg-amber-500" : ""}
                        ${index === 1 ? "bg-slate-400" : ""}
                        ${index === 2 ? "bg-amber-700" : ""}
                        ${index > 2 ? "bg-muted-foreground" : ""}
                      `}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{member.memberName}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {member.conversionRate}% converted
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {member.userInvitesCompleted} of{" "}
                        {member.userInvitesScanned} invites
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
              <CardTitle>Most Active Inviters</CardTitle>
            </div>
            <CardDescription>
              Church members with the highest number of invite QR scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboardData.topScanners.length ? (
              <div className="space-y-6">
                {leaderboardData.topScanners.map((member, index) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold
                        ${index === 0 ? "bg-blue-500" : ""}
                        ${index === 1 ? "bg-blue-400" : ""}
                        ${index === 2 ? "bg-blue-300" : ""}
                        ${index > 2 ? "bg-muted-foreground" : ""}
                      `}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{member.memberName}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {member.userInvitesScanned} scans
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {member.userInvitesSent} invites sent
                      </div>
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

      {/* Church Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Church Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                Overall Conversion Rate
              </span>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {leaderboardData.churchWideStats.churchConversionRate}%
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Church Invitations</span>
              <Badge variant="outline">
                {leaderboardData.churchWideStats.totalChurchInvitesSent}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">User Invitations</span>
              <Badge variant="outline">
                {leaderboardData.churchWideStats.totalUserInvitesSent}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
