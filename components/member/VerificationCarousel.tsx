"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MemberVerificationCard from "./MemberVerificationCard";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface VerificationRequest {
  id: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    bio?: string;
    services?: string;
    city?: string;
    state?: string;
  };
  church: {
    name: string;
    minVerificationsRequired: number;
  };
  createdAt: string;
  notes?: string;
  progress: {
    current: number;
    required: number;
    remaining: number;
    verifierNames: string[];
  };
}

interface VerificationCarouselProps {
  churchId: string;
  isEligible: boolean;
}

export default function VerificationCarousel({
  churchId,
  isEligible,
}: VerificationCarouselProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/churches/member-requests?churchId=${churchId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch requests");
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching verification requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (churchId && isEligible) {
      fetchVerificationRequests();
    }
  }, [churchId, isEligible]);

  const handleVerificationComplete = () => {
    // Refresh the requests after a verification is completed
    fetchVerificationRequests();
  };

  const nextRequest = () => {
    setCurrentIndex((prev) => (prev + 1) % requests.length);
  };

  const prevRequest = () => {
    setCurrentIndex((prev) => (prev - 1 + requests.length) % requests.length);
  };

  // Don't render if user is not eligible
  if (!isEligible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            Community Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-sm md:text-base mb-2">
              Verification Available Soon
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              You'll be able to help verify new members after being a verified
              church member for 7 days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            Community Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Loading verification requests...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            Community Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-medium text-sm md:text-base mb-2">
              Unable to Load Requests
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <Button
              onClick={fetchVerificationRequests}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            Community Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-sm md:text-base mb-2">
              All Caught Up!
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              There are no pending verification requests at the moment. Check
              back later to help welcome new members to your community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRequest = requests[currentIndex];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            Community Verification
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className="text-xs md:text-sm">
              {currentIndex + 1} of {requests.length}
            </Badge>
            {requests.length > 1 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevRequest}
                  disabled={requests.length <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextRequest}
                  disabled={requests.length <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs md:text-sm text-muted-foreground">
          Help review new members wanting to join your church community.
        </div>

        <MemberVerificationCard
          key={currentRequest.id}
          request={currentRequest}
          onVerificationComplete={handleVerificationComplete}
        />

        {requests.length > 1 && (
          <div className="flex justify-center pt-2">
            <div className="flex gap-1.5">
              {requests.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to request ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
