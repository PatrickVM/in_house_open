"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Users, Eye, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

interface InviteStats {
  analytics: {
    userInvitesScanned: number;
    userInvitesCompleted: number;
  };
  inviteCode: {
    code: string;
    scans: number;
    createdAt: string;
    lastScannedAt?: string;
  } | null;
  invitees: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt: string;
  }>;
}

export default function InviteStatsWidget() {
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/invite/analytics");
        const data = await response.json();

        if (response.ok) {
          setStats(data);
        } else if (response.status === 403) {
          setIsEligible(false);
        }
      } catch (error) {
        console.error("Failed to fetch invite stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!isEligible) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Get verified as a church member to invite trusted friends to
              InHouse.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/profile">Complete Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const conversionRate =
    stats.analytics.userInvitesScanned > 0
      ? Math.round(
          (stats.analytics.userInvitesCompleted /
            stats.analytics.userInvitesScanned) *
            100
        )
      : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Invite Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">
              {stats.inviteCode?.scans || 0}
            </div>
            <div className="text-xs text-muted-foreground">Scans</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {stats.invitees.length}
            </div>
            <div className="text-xs text-muted-foreground">Joined</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">
              {conversionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Rate</div>
          </div>
        </div>

        {/* Invite Code */}
        {stats.inviteCode && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Your Code</p>
                <code className="text-sm font-mono font-medium">
                  {stats.inviteCode.code}
                </code>
              </div>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats.invitees.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Invitees</p>
            <div className="space-y-1">
              {stats.invitees.slice(0, 2).map((invitee) => (
                <div
                  key={invitee.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="flex-1 truncate">
                    {invitee.firstName && invitee.lastName
                      ? `${invitee.firstName} ${invitee.lastName}`
                      : invitee.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(invitee.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {stats.invitees.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{stats.invitees.length - 2} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Last Scan */}
        {stats.inviteCode?.lastScannedAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            Last scanned{" "}
            {new Date(stats.inviteCode.lastScannedAt).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button asChild className="w-full" size="sm">
            <Link href="/invite">
              <QrCode className="h-4 w-4 mr-2" />
              View QR Code
            </Link>
          </Button>

          {stats.analytics.userInvitesCompleted > 0 && (
            <div className="flex items-center justify-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              You've helped {stats.analytics.userInvitesCompleted} people join!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
