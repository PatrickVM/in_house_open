"use client";

import { useState, useEffect, useCallback } from "react";
import ActivityLogFilters from "./ActivityLogFilters";
import ActivityLogFeed from "./ActivityLogFeed";
import {
  ActivityLogResponse,
  ActivityCategory,
} from "@/lib/activity-logs/types";

interface Filters {
  userId?: string;
  categories: ActivityCategory[];
  dateRange: "1h" | "24h" | "7d" | "30d" | "all";
}

interface PaginationState {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState<ActivityLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    dateRange: "7d",
  });

  // Fetch activity logs
  const fetchLogs = useCallback(
    async (loadMore = false) => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        params.set("limit", pagination.limit.toString());
        params.set("offset", (loadMore ? pagination.offset : 0).toString());
        params.set("dateRange", filters.dateRange);

        if (filters.userId) {
          params.set("userId", filters.userId);
        }

        if (filters.categories.length > 0) {
          filters.categories.forEach((category) => {
            params.append("category", category);
          });
        }

        const response = await fetch(`/api/admin/activity-logs?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch activity logs");
        }

        const data = await response.json();

        setLogs((prevLogs) => {
          if (loadMore) {
            return [...prevLogs, ...data.logs];
          } else {
            return data.logs;
          }
        });

        setPagination({
          total: data.pagination.total,
          limit: data.pagination.limit,
          offset: loadMore
            ? pagination.offset + data.logs.length
            : data.logs.length,
          hasMore: data.pagination.hasMore,
        });
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        // Could add toast notification here
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit, pagination.offset]
  );

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  // Handle load more
  const handleLoadMore = () => {
    fetchLogs(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }));
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <ActivityLogFilters onFilterChange={handleFilterChange} />
      <ActivityLogFeed
        logs={logs}
        loading={loading}
        hasMore={pagination.hasMore}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
