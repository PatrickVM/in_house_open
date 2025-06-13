"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ChurchFilterSection from "./ChurchFilterSection";
import InvitationsTable from "@/components/admin/analytics/InvitationsTable";
import PaginationControls from "@/components/admin/analytics/PaginationControls";
import { Loader2 } from "lucide-react";

interface ChurchInvitationsTabProps {
  churchId: string;
}

export default function ChurchInvitationsTab({
  churchId,
}: ChurchInvitationsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Memoize current filters to prevent unnecessary re-renders
  const currentFilters = useMemo(() => {
    const status = searchParams.getAll("status");
    const dateRange = searchParams.get("dateRange") || "all";
    const type = searchParams.get("type") || "church";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    return {
      status,
      dateRange,
      type,
      page,
      limit,
    };
  }, [searchParams]);

  // Fetch invitations with filters
  const fetchInvitations = useCallback(
    async (filters: any) => {
      setLoading(true);

      try {
        // Build query string from filters
        const params = new URLSearchParams();

        if (filters.status?.length) {
          filters.status.forEach((status: string) =>
            params.append("status", status)
          );
        }
        if (filters.dateRange) params.append("dateRange", filters.dateRange);
        if (filters.type) params.append("type", filters.type);
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());

        const response = await fetch(
          `/api/church/analytics/invitations?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invitations");
        }

        const data = await response.json();

        // Add type field to distinguish between church and user invitations
        const processedInvitations = data.invitations.map(
          (invitation: any) => ({
            ...invitation,
            type: filters.type,
          })
        );

        setInvitations(processedInvitations);
        setPagination(data.pagination);

        // Update URL with current filters (without refreshing page)
        const newParams = new URLSearchParams(window.location.search);

        // Clear existing filter params
        newParams.delete("status");
        newParams.delete("dateRange");
        newParams.delete("type");
        newParams.delete("page");
        newParams.delete("limit");

        // Add new filter params
        if (filters.status?.length) {
          filters.status.forEach((status: string) =>
            newParams.append("status", status)
          );
        }
        if (filters.dateRange !== "all") {
          newParams.set("dateRange", filters.dateRange);
        }
        if (filters.type !== "church") {
          newParams.set("type", filters.type);
        }
        if (filters.page > 1) {
          newParams.set("page", filters.page.toString());
        }
        if (filters.limit !== 15) {
          newParams.set("limit", filters.limit.toString());
        }

        // Update URL without refreshing
        router.replace(`${window.location.pathname}?${newParams.toString()}`, {
          scroll: false,
        });
      } catch (error) {
        console.error("Error fetching invitations:", error);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    fetchInvitations(filters);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    const filters = { ...currentFilters, page };
    fetchInvitations(filters);
  };

  // Handle page size changes
  const handlePageSizeChange = (pageSize: number) => {
    const filters = { ...currentFilters, limit: pageSize, page: 1 };
    fetchInvitations(filters);
  };

  // Initial load - only run once on mount and when currentFilters change
  useEffect(() => {
    fetchInvitations(currentFilters);
  }, [currentFilters, fetchInvitations]);

  return (
    <div className="space-y-6">
      <ChurchFilterSection onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Church Member Invitations</CardTitle>
          <CardDescription>
            View invitation activity from your verified church members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <InvitationsTable
                invitations={invitations}
                viewOnly={true} // Church context is view-only
                onStatusChange={() => {}} // No-op for view-only
                onDelete={() => {}} // No-op for view-only
              />

              {invitations.length > 0 && (
                <PaginationControls
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.limit}
                  totalItems={pagination.totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
