"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Clock,
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

interface MemberVerificationCardProps {
  request: VerificationRequest;
  onVerificationComplete?: () => void;
}

export default function MemberVerificationCard({
  request,
  onVerificationComplete,
}: MemberVerificationCardProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [memberNotes, setMemberNotes] = useState("");

  const handleVerification = async (action: "approve" | "reject") => {
    try {
      setProcessing(true);

      const response = await fetch("/api/churches/verify-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.id,
          action,
          memberNotes: memberNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process verification");
      }

      const result = await response.json();

      if (action === "approve") {
        toast.success(
          "Verification approved! Thank you for helping the community."
        );
      } else {
        toast.success("Your feedback has been recorded.");
      }

      // Call the callback to refresh the parent component
      if (onVerificationComplete) {
        onVerificationComplete();
      }

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error("Error processing verification:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process verification"
      );
    } finally {
      setProcessing(false);
    }
  };

  const userName =
    request.user.firstName && request.user.lastName
      ? `${request.user.firstName} ${request.user.lastName}`
      : request.user.email;

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        {/* Member Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm md:text-base">{userName}</h4>
              <p className="text-xs md:text-sm text-muted-foreground">
                Wants to join {request.church.name}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-200 bg-amber-50 flex-shrink-0"
          >
            <Clock className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Pending</span>
          </Badge>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              Verification Progress
            </span>
            <span className="text-xs md:text-sm text-muted-foreground">
              {request.progress.current} of {request.progress.required}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${
                  (request.progress.current / request.progress.required) * 100
                }%`,
              }}
            />
          </div>
          {request.progress.verifierNames.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Verified by:</span>{" "}
              {request.progress.verifierNames.join(", ")}
            </p>
          )}
        </div>

        {/* Member Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            Requested {new Date(request.createdAt).toLocaleDateString()}
          </div>

          {request.user.city && request.user.state && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              {request.user.city}, {request.user.state}
            </div>
          )}
        </div>

        {/* Profile Information */}
        {(request.user.bio || request.user.services) && (
          <div className="space-y-3 mb-4 p-3 bg-muted/50 rounded-lg">
            {request.user.bio && (
              <div>
                <h5 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                  About
                </h5>
                <p className="text-xs md:text-sm">{request.user.bio}</p>
              </div>
            )}
            {request.user.services && (
              <div>
                <h5 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                  Services & Skills
                </h5>
                <div className="flex flex-wrap gap-1">
                  {request.user.services.split(",").map((service, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs px-2 py-0.5"
                    >
                      {service.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request Notes */}
        {request.notes && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <h5 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
              Request Notes
            </h5>
            <p className="text-xs md:text-sm">{request.notes}</p>
          </div>
        )}

        {/* Member Notes Section */}
        {showNotes && (
          <div className="space-y-2 mb-4">
            <h5 className="text-xs md:text-sm font-medium text-muted-foreground">
              Add Verification Notes (Optional)
            </h5>
            <Textarea
              placeholder="Share any thoughts about this member..."
              value={memberNotes}
              onChange={(e) => setMemberNotes(e.target.value)}
              rows={3}
              className="text-xs md:text-sm"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleVerification("approve")}
              disabled={processing}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Approve</span>
              <span className="sm:hidden">✓</span>
            </Button>

            <Button
              onClick={() => handleVerification("reject")}
              disabled={processing}
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Decline</span>
              <span className="sm:hidden">✗</span>
            </Button>
          </div>

          <Button
            onClick={() => setShowNotes(!showNotes)}
            size="sm"
            variant="ghost"
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showNotes ? "Hide Notes" : "Add Notes"}
          </Button>
        </div>

        {/* Help Text - Only visible on hover, no space when hidden */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-muted opacity-0 hover:opacity-100 h-0 hover:h-auto overflow-hidden hover:overflow-visible transition-all duration-300 cursor-default">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm text-foreground font-medium mb-1">
                Community Verification
              </p>
              <p className="text-xs text-muted-foreground">
                Help ensure our community remains welcoming. This person needs{" "}
                <span className="font-medium">
                  {request.progress.remaining} more verification(s)
                </span>{" "}
                to join.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
