"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ChevronDown, RefreshCw } from "lucide-react";
import {
  ActivityLogResponse,
  ActivityCategory,
} from "@/lib/activity-logs/types";

interface ActivityLogFeedProps {
  logs: ActivityLogResponse[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
}

interface ActivityIconConfig {
  icon: string;
  bgColor: string;
  textColor: string;
}

const getActivityConfig = (category: ActivityCategory): ActivityIconConfig => {
  const configs: Record<ActivityCategory, ActivityIconConfig> = {
    walkthrough: {
      icon: "🎯",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    invitation: {
      icon: "📧",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    church: {
      icon: "⛪",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    content: {
      icon: "📝",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    user: {
      icon: "👤",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    admin: {
      icon: "🔧",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
  };

  return (
    configs[category] || {
      icon: "📋",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
    }
  );
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-700 border-red-200";
    case "CHURCH":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "USER":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

function ActivityLogSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityLogFeed({
  logs,
  loading,
  hasMore,
  onLoadMore,
  onRefresh,
}: ActivityLogFeedProps) {
  const [expanding, setExpanding] = useState<string | null>(null);

  const handleShowDetails = (logId: string) => {
    setExpanding(expanding === logId ? null : logId);
  };

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>
            Real-time activity across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLogSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!loading && logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>
            Real-time activity across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Activity Found</h3>
            <p className="text-muted-foreground">
              No activity logs match your current filters.
            </p>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>
              Real-time activity across the platform ({logs.length} activities)
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => {
            const config = getActivityConfig(log.category);
            const isExpanded = expanding === log.id;

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg text-lg ${config.bgColor}`}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRoleBadgeColor(log.userRole)}`}
                    >
                      {log.userRole}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.category}
                    </Badge>
                    {log.details && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowDetails(log.id)}
                        className="h-6 px-2 text-xs"
                      >
                        {isExpanded ? "Hide" : "Details"}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${
                            isExpanded ? "transform rotate-180" : ""
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                  {isExpanded && log.details && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <h4 className="text-xs font-medium mb-2">Details:</h4>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && logs.length > 0 && (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {hasMore && !loading && onLoadMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={onLoadMore}>
                Load More Activities
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
