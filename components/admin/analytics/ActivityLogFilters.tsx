"use client";

import { useState, useEffect } from "react";
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
  RotateCcw,
  Users,
  Tag,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ActivityCategory } from "@/lib/activity-logs/types";

interface ActivityLogFiltersProps {
  onFilterChange: (filters: {
    userId?: string;
    categories: ActivityCategory[];
    dateRange: "1h" | "24h" | "7d" | "30d" | "all";
  }) => void;
}

const categoryOptions = [
  { value: "walkthrough", label: "Walkthrough", icon: "🎯" },
  { value: "invitation", label: "Invitations", icon: "📧" },
  { value: "church", label: "Church", icon: "⛪" },
  { value: "content", label: "Content", icon: "📝" },
  { value: "user", label: "User", icon: "👤" },
  { value: "admin", label: "Admin", icon: "🔧" },
] as const;

const dateRangeOptions = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
] as const;

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export default function ActivityLogFilters({
  onFilterChange,
}: ActivityLogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<
    ActivityCategory[]
  >([]);
  const [dateRange, setDateRange] = useState<
    "1h" | "24h" | "7d" | "30d" | "all"
  >("7d");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for the user filter
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch("/api/admin/users?limit=100");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Handle filter changes
  const handleFilter = () => {
    const filters = {
      userId: selectedUser === "all" ? undefined : selectedUser,
      categories: selectedCategories,
      dateRange,
    };
    onFilterChange(filters);
  };

  // Reset filters
  const handleReset = () => {
    setSelectedUser("all");
    setSelectedCategories([]);
    setDateRange("7d");

    onFilterChange({
      userId: undefined,
      categories: [],
      dateRange: "7d",
    });
  };

  // Handle category toggle
  const toggleCategory = (category: ActivityCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Count active filters
  const activeFilterCount = [
    selectedUser !== "all" ? selectedUser : null,
    ...selectedCategories,
    dateRange !== "7d" ? dateRange : null,
  ].filter(Boolean).length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-base">Activity Filters</CardTitle>
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
              Filter activity logs by user, category, and date range
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-3 w-3" /> User
                </Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {loadingUsers ? (
                      <SelectItem value="loading" disabled>
                        Loading users...
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-3 w-3" /> Categories
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <Badge
                      key={category.value}
                      variant={
                        selectedCategories.includes(
                          category.value as ActivityCategory
                        )
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-xs"
                      onClick={() =>
                        toggleCategory(category.value as ActivityCategory)
                      }
                    >
                      {category.icon} {category.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Date Range
                </Label>
                <Select
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as any)}
                >
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
