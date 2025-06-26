"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Package,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MemberRequest {
  id: string;
  status: string;
  requestedAt: string;
  expiresAt: string;
  memberNotes: string | null;
  daysRemaining: number;
  isExpiringSoon: boolean;
  item: {
    id: string;
    title: string;
    description: string | null;
    memberDescription: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    church: {
      name: string;
      leadContact: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
      };
    };
  };
}

interface ApiResponse {
  requests: MemberRequest[];
  activeCount: number;
  maxAllowed: number;
}

interface MemberRequestsListProps {
  className?: string;
}

export default function MemberRequestsList({
  className,
}: MemberRequestsListProps) {
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/user/my-requests");
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      setRequests(data.requests);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
  };

  const handleMarkReceived = async (itemId: string, itemTitle: string) => {
    setActionLoading(itemId);
    try {
      const response = await fetch(`/api/user/items/${itemId}/received`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as received");
      }

      toast({
        title: "Marked as Received",
        description: `"${itemTitle}" has been marked as received.`,
      });

      await fetchRequests();
    } catch (error) {
      toast({
        title: "Action Failed",
        description:
          error instanceof Error ? error.message : "Failed to mark as received",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRequest = async (itemId: string, itemTitle: string) => {
    setActionLoading(itemId);
    try {
      const response = await fetch(`/api/user/items/${itemId}/request`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel request");
      }

      toast({
        title: "Request Cancelled",
        description: `Your request for "${itemTitle}" has been cancelled.`,
      });

      await fetchRequests();
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description:
          error instanceof Error ? error.message : "Failed to cancel request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatLocation = (request: MemberRequest) => {
    const parts = [
      request.item.address,
      request.item.city,
      request.item.state,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getStatusBadge = (request: MemberRequest) => {
    switch (request.status) {
      case "REQUESTED":
        return (
          <Badge
            variant={request.isExpiringSoon ? "destructive" : "default"}
            className="text-xs"
          >
            {request.isExpiringSoon ? "Expiring Soon" : "Requested"}
          </Badge>
        );
      case "RECEIVED":
        return (
          <Badge variant="secondary" className="text-xs">
            Received
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="text-xs">
            Cancelled
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {request.status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Requested Items
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
            <Package className="w-5 h-5" />
            My Requested Items
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

  if (requests.length === 0) {
    return null; // Don't show the component if no requests
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              My Requested Items
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {requests.length} active
              </Badge>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 space-y-3 ${
                  request.isExpiringSoon ? "border-red-200 bg-red-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">
                      {request.item.title}
                    </h4>
                    {request.item.memberDescription && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {request.item.memberDescription}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(request)}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {request.daysRemaining > 0
                        ? `${request.daysRemaining} days left`
                        : "Expired"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{formatLocation(request)}</span>
                  </div>
                </div>

                {request.memberNotes && (
                  <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="font-medium text-blue-800">Your Note:</p>
                    <p className="text-blue-700">{request.memberNotes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    <p>
                      Contact: {request.item.church.leadContact.firstName}{" "}
                      {request.item.church.leadContact.lastName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {request.item.church.leadContact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{request.item.church.leadContact.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{request.item.church.leadContact.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {request.status === "REQUESTED" && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMarkReceived(
                                  request.item.id,
                                  request.item.title
                                )
                              }
                              disabled={actionLoading === request.item.id}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark as received</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCancelRequest(
                                  request.item.id,
                                  request.item.title
                                )
                              }
                              disabled={actionLoading === request.item.id}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cancel request</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {request.isExpiringSoon &&
                      request.status === "REQUESTED" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              This request expires in {request.daysRemaining}{" "}
                              day(s)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
