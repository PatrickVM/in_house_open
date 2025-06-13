"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Calendar,
  Building,
  Clock,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// List of possible invitation statuses
const invitationStatuses = [
  { value: "PENDING", label: "Pending", color: "bg-blue-500" },
  { value: "CLAIMED", label: "Claimed", color: "bg-green-500" },
  { value: "EXPIRED", label: "Expired", color: "bg-gray-500" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-500" },
];

// List of date range options
const dateRangeOptions = [
  { value: "7days", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

// Invitation type options
const invitationTypeOptions = [
  { value: "church", label: "Church Invitations" },
  { value: "user", label: "User Invitations" },
];

type FilterProps = {
  churches: Array<{ id: string; name: string }>;
  onFilterChange: (filters: any) => void;
};

export default function FilterSection({
  churches,
  onFilterChange,
}: FilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for filter values
  const [isOpen, setIsOpen] = useState(true);
  const [selectedChurch, setSelectedChurch] = useState<string>(
    searchParams.get("churchId") || "all"
  );
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
      churchId: selectedChurch,
      status: selectedStatuses,
      dateRange,
      type: invitationType,
      page: 1, // Reset to first page on filter change
    };
    onFilterChange(filters);
  };

  // Reset filters
  const handleReset = () => {
    setSelectedChurch("all");
    setSelectedStatuses([]);
    setDateRange("all");
    setInvitationType("church");

    onFilterChange({
      churchId: "all",
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
    selectedChurch !== "all" ? selectedChurch : null,
    ...selectedStatuses,
    dateRange !== "all" ? dateRange : null,
    invitationType !== "church" ? invitationType : null,
  ].filter(Boolean).length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Filter className="h-4 w-4" />
                <CardTitle>Filters</CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 gap-1"
              >
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
          <CardDescription>
            Filter invitations by church, status, date and type
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="grid gap-6 pt-3 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Church filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-3 w-3" /> Church
                </Label>
                <Select
                  value={selectedChurch}
                  onValueChange={setSelectedChurch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All churches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All churches</SelectItem>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-3 w-3" /> Status
                </Label>
                <div className="flex flex-wrap gap-2">
                  {invitationStatuses.map((status) => (
                    <Badge
                      key={status.value}
                      variant={
                        selectedStatuses.includes(status.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Date Range filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Date Range
                </Label>
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

              {/* Invitation Type filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Invitation Type
                </Label>
                <Select
                  value={invitationType}
                  onValueChange={setInvitationType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {invitationTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Apply filters button */}
            <div className="flex justify-end">
              <Button onClick={handleFilter} className="w-full md:w-auto">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
