"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestItemButton } from "@/components/items/RequestItemButton";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemberItemCarouselProps {
  className?: string;
}

interface ItemData {
  id: string;
  title: string;
  description: string | null;
  memberDescription: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  church: {
    id: string;
    name: string;
    leadContact: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone: string | null;
    };
  };
  memberRequests: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    };
  }>;
}

interface ApiResponse {
  items: ItemData[];
  hasMore: boolean;
}

export default function MemberItemCarousel({
  className,
}: MemberItemCarouselProps) {
  const [items, setItems] = useState<ItemData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/user/available-items");
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Only verified church members can view available items"
          );
        }
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      setItems(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const formatLocation = (item: ItemData) => {
    const parts = [item.address, item.city, item.state].filter(Boolean);
    return parts.join(", ");
  };

  const getItemStatus = (item: ItemData) => {
    if (item.memberRequests.length === 0) {
      return { status: "available", message: "Available to request" };
    }

    const activeRequest = item.memberRequests[0];
    return {
      status: "requested",
      message: `Requested by ${activeRequest.user.firstName} ${activeRequest.user.lastName}`,
      requesterName: `${activeRequest.user.firstName} ${activeRequest.user.lastName}`,
    };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Church Items
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Available Church Items
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Church Items
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No items are currently available from your church.</p>
            <p className="text-sm mt-2">
              Items will appear here when your church leaders share them with
              members.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentItem = items[currentIndex];
  const itemStatus = getItemStatus(currentItem);

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Available Church Items</span>
              <span className="sm:hidden">Available Items</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Items shared by your church leaders</p>
                  <p>Requests expire after 7 days</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge variant="outline" className="text-xs px-1.5 sm:px-2">
                {currentIndex + 1} of {items.length}
              </Badge>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                <span className="text-xs sm:text-sm">
                  {refreshing ? "..." : "↻"}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Navigation buttons */}
            {items.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0"
                  onClick={prevItem}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 p-0"
                  onClick={nextItem}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Item content */}
            <div className="px-4 sm:px-8">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg leading-tight">
                    {currentItem.title}
                  </h3>
                  {currentItem.memberDescription && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      {currentItem.memberDescription}
                    </p>
                  )}
                </div>

                {currentItem.description && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {currentItem.description}
                  </p>
                )}

                {/* Location - more compact */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {formatLocation(currentItem)}
                  </span>
                </div>

                {/* Status and Action - more compact layout */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Badge
                    variant={
                      itemStatus.status === "available"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs px-2 py-0.5 flex-shrink-0"
                  >
                    {itemStatus.status === "available"
                      ? "Available"
                      : "Requested"}
                  </Badge>

                  <RequestItemButton
                    item={currentItem}
                    onSuccess={handleRefresh}
                    disabled={itemStatus.status === "requested"}
                  />
                </div>

                {/* Contact info - simplified and compact */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">
                      Contact: {currentItem.church.leadContact.firstName}{" "}
                      {currentItem.church.leadContact.lastName}
                    </span>
                    {currentItem.church.leadContact.phone && (
                      <span className="ml-2 flex-shrink-0 font-mono">
                        {currentItem.church.leadContact.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
