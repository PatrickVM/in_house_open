"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter, RotateCcw } from "lucide-react";

interface FilterProps {
  onFilterChange: (filters: {
    status: string[];
    dateRange: string;
    type: string;
    page: number;
  }) => void;
}

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const dateRangeOptions = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const typeOptions = [
  { value: "church", label: "Church Invitations" },
  { value: "user", label: "User Invitations" },
];

export default function ChurchFilterSection({ onFilterChange }: FilterProps) {
  const searchParams = useSearchParams();

  // State for filter values
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.getAll("status")
  );
  const [dateRange, setDateRange] = useState<string>(
    searchParams.get("dateRange") || "all"
  );
  const [invitationType, setInvitationType] = useState<string>(
    searchParams.get("type") || "church"
  );

  // Handle filter changes
  const handleFilter = () => {
    const filters = {
      status: selectedStatuses,
      dateRange,
      type: invitationType,
      page: 1, // Reset to first page on filter change
    };
    onFilterChange(filters);
  };

  // Reset filters
  const handleReset = () => {
    setSelectedStatuses([]);
    setDateRange("all");
    setInvitationType("church");

    onFilterChange({
      status: [],
      dateRange: "all",
      type: "church",
      page: 1,
    });
  };

  // Handle status toggle
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Count active filters
  const activeFilterCount = [
    ...selectedStatuses,
    dateRange !== "all" ? dateRange : null,
    invitationType !== "church" ? invitationType : null,
  ].filter(Boolean).length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-base">Filters</CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
            <CardDescription>
              Filter invitations by status, date range, and type
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Invitation Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Invitation Type</label>
              <Select value={invitationType} onValueChange={setInvitationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter (only for church invitations) */}
            {invitationType === "church" && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((status) => (
                    <div
                      key={status.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={status.value}
                        checked={selectedStatuses.includes(status.value)}
                        onCheckedChange={() => toggleStatus(status.value)}
                      />
                      <label
                        htmlFor={status.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button onClick={handleFilter} className="flex-1">
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
