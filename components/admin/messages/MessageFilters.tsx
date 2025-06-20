"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface MessageFiltersProps {
  churches: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
  }>;
}

export default function MessageFilters({ churches }: MessageFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Current filter values
  const currentMessageType = searchParams.get("messageType") || "all";
  const currentChurch = searchParams.get("church") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const currentDateRange = searchParams.get("dateRange") || "7d";
  const currentCategory = searchParams.get("category") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 when filtering
    params.delete("page");
    router.push(`/admin/messages?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push("/admin/messages");
  };

  const hasActiveFilters =
    currentMessageType !== "all" ||
    currentChurch !== "all" ||
    currentStatus !== "all" ||
    currentDateRange !== "7d" ||
    currentCategory !== "all";

  return (
    <Card>
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-between text-white hover:bg-gray-700"
        >
          <span className="font-medium">
            Filters {hasActiveFilters && "(Active)"}
          </span>
          {showFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Message Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Message Type
              </label>
              <Select
                value={currentMessageType}
                onValueChange={(value) => updateFilter("messageType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Messages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="church">Church Messages</SelectItem>
                  <SelectItem value="user">User Messages</SelectItem>
                  <SelectItem value="DAILY_MESSAGE">Daily Messages</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                  <SelectItem value="USER_SHARE">User Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Church Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Church
              </label>
              <Select
                value={currentChurch}
                onValueChange={(value) => updateFilter("church", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Churches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Churches</SelectItem>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name} ({church.city}, {church.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Status
              </label>
              <Select
                value={currentStatus}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Date Range
              </label>
              <Select
                value={currentDateRange}
                onValueChange={(value) => updateFilter("dateRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Last 7 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter (for user messages) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Category
              </label>
              <Select
                value={currentCategory}
                onValueChange={(value) => updateFilter("category", value)}
                disabled={
                  currentMessageType !== "user" &&
                  currentMessageType !== "USER_SHARE" &&
                  currentMessageType !== "all"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="TESTIMONY">Testimonies</SelectItem>
                  <SelectItem value="PRAYER_REQUEST">
                    Prayer Requests
                  </SelectItem>
                  <SelectItem value="GOD_WINK">God Winks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
