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
import FilterSection from "@/components/admin/analytics/FilterSection";
import InvitationsTable from "@/components/admin/analytics/InvitationsTable";
import PaginationControls from "@/components/admin/analytics/PaginationControls";
import { Loader2 } from "lucide-react";

export default function InvitationsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [loading, setLoading] = useState(true);
  const [churches, setChurches] = useState<Array<{ id: string; name: string }>>(
    []
  );
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
    const churchId = searchParams.get("churchId") || "";
    const status = searchParams.getAll("status");
    const dateRange = searchParams.get("dateRange") || "all";
    const type = searchParams.get("type") || "church";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    return {
      churchId: churchId === "all" ? "" : churchId, // Convert "all" to empty string for API
      status,
      dateRange,
      type,
      page,
      limit,
    };
  }, [searchParams]);

  // Fetch churches for the filter dropdown
  const fetchChurches = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/churches?limit=100");
      if (response.ok) {
        const data = await response.json();
        setChurches(
          data.churches.map((church: any) => ({
            id: church.id,
            name: church.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching churches:", error);
    }
  }, []);

  // Fetch invitations with filters
  const fetchInvitations = useCallback(async (filters: any) => {
    setLoading(true);

    try {
      // Build query string from filters
      const params = new URLSearchParams();

      // Only add churchId if it's not empty (handles "all" case)
      if (filters.churchId && filters.churchId !== "all") {
        params.append("churchId", filters.churchId);
      }
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
        `/api/admin/analytics/invitations?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }

      const data = await response.json();

      // Add type field to distinguish between church and user invitations
      const processedInvitations = data.invitations.map((invitation: any) => ({
        ...invitation,
        type: filters.type,
      }));

      setInvitations(processedInvitations);
      setPagination(data.pagination);

      // Update URL with current filters (without refreshing page)
      const newParams = new URLSearchParams(window.location.search);

      // Clear existing params
      Array.from(newParams.keys()).forEach((key) => {
        if (
          ["churchId", "status", "dateRange", "type", "page", "limit"].includes(
            key
          )
        ) {
          newParams.delete(key);
        }
      });

      // Add new params - use "all" for display but don't send to API
      const displayChurchId = filters.churchId || "all";
      if (displayChurchId !== "all") {
        newParams.set("churchId", displayChurchId);
      }
      if (filters.status?.length) {
        newParams.delete("status"); // Clear existing first
        filters.status.forEach((status: string) =>
          newParams.append("status", status)
        );
      }
      if (filters.dateRange) newParams.set("dateRange", filters.dateRange);
      if (filters.type) newParams.set("type", filters.type);
      if (filters.page) newParams.set("page", filters.page.toString());
      if (filters.limit) newParams.set("limit", filters.limit.toString());

      const newUrl = `${window.location.pathname}?${newParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filters: any) => {
      fetchInvitations({
        ...currentFilters,
        ...filters,
      });
    },
    [currentFilters, fetchInvitations]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      fetchInvitations({
        ...currentFilters,
        page,
      });
    },
    [currentFilters, fetchInvitations]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (limit: number) => {
      fetchInvitations({
        ...currentFilters,
        limit,
        page: 1, // Reset to first page when changing page size
      });
    },
    [currentFilters, fetchInvitations]
  );

  // Initial load - only run once on mount and when currentFilters change
  useEffect(() => {
    fetchChurches();
  }, []); // Only run once on mount

  useEffect(() => {
    fetchInvitations(currentFilters);
  }, [currentFilters, fetchInvitations]); // Run when filters change

  return (
    <div className="space-y-6">
      <FilterSection churches={churches} onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            Manage all invitations sent in the platform
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
                onStatusChange={() => fetchInvitations(currentFilters)}
                onDelete={() => fetchInvitations(currentFilters)}
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
