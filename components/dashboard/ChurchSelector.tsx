"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Church,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface Church {
  id: string;
  name: string;
  leadPastorName: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  leadContact: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  memberCount: number;
  userRequestStatus?: string | null;
}

interface ChurchSearchResponse {
  churches: Church[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ChurchSelector() {
  const router = useRouter();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submittingRequest, setSubmittingRequest] = useState<string | null>(
    null
  );

  const fetchChurches = async (search = "", pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: pageNum.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/churches/search?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch churches");
      }

      const data: ChurchSearchResponse = await response.json();
      setChurches(data.churches);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching churches:", error);
      toast.error("Failed to load churches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches(searchTerm, page);
  }, [searchTerm, page]);

  const handleJoinRequest = async (churchId: string) => {
    try {
      setSubmittingRequest(churchId);

      const response = await fetch("/api/churches/join-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          churchId,
          notes: "Requesting to join this church community",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit request");
      }

      toast.success("Join request submitted successfully!");

      // Refresh the churches list to update status
      await fetchChurches(searchTerm, page);

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error submitting join request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request"
      );
    } finally {
      setSubmittingRequest(null);
    }
  };

  const getRequestStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search churches by name, city, or pastor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild variant="outline">
          <Link href="/church/apply">
            <Plus className="w-4 h-4 mr-2" />
            Invite Church
          </Link>
        </Button>
      </div>

      {/* Churches List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : churches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Church className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No churches found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No churches are currently available"}
            </p>
            <Button asChild>
              <Link href="/church/apply">
                <Plus className="w-4 h-4 mr-2" />
                Invite Your Church
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {churches.map((church) => (
            <Card key={church.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{church.name}</h3>
                      {getRequestStatusBadge(church.userRequestStatus)}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Pastor: {church.leadPastorName}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {church.address}, {church.city}, {church.state}{" "}
                        {church.zipCode}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {church.memberCount} member
                        {church.memberCount !== 1 ? "s" : ""}
                      </div>
                      {church.website && (
                        <div>
                          <a
                            href={church.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {church.userRequestStatus === "PENDING" ? (
                      <Button disabled variant="outline">
                        <Clock className="w-4 h-4 mr-2" />
                        Request Pending
                      </Button>
                    ) : church.userRequestStatus === "APPROVED" ? (
                      <Button disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Already Member
                      </Button>
                    ) : church.userRequestStatus === "REJECTED" ? (
                      <Button
                        onClick={() => handleJoinRequest(church.id)}
                        disabled={submittingRequest === church.id}
                        variant="outline"
                      >
                        {submittingRequest === church.id
                          ? "Submitting..."
                          : "Request Again"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinRequest(church.id)}
                        disabled={submittingRequest === church.id}
                      >
                        {submittingRequest === church.id
                          ? "Submitting..."
                          : "Request to Join"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
