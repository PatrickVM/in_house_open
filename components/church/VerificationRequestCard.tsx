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
  createdAt: Date;
  notes?: string;
}

interface VerificationRequestCardProps {
  request: VerificationRequest;
  churchId: string;
  isLeadContact: boolean;
}

export default function VerificationRequestCard({
  request,
  churchId,
  isLeadContact,
}: VerificationRequestCardProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

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
          notes: verificationNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process verification");
      }

      const result = await response.json();

      if (action === "approve") {
        toast.success(result.message);
      } else {
        toast.success("Request rejected successfully");
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
    <Card className="border-l-4 border-l-amber-500">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold">{userName}</h4>
                <p className="text-sm text-muted-foreground">
                  {request.user.email}
                </p>
                {request.user.city && request.user.state && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {request.user.city}, {request.user.state}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Requested {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-200"
            >
              Pending Verification
            </Badge>
          </div>

          {/* User Details */}
          {(request.user.bio || request.user.services) && (
            <div className="space-y-2">
              {request.user.bio && (
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground">
                    Bio
                  </h5>
                  <p className="text-sm">{request.user.bio}</p>
                </div>
              )}
              {request.user.services && (
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground">
                    Services/Skills
                  </h5>
                  <p className="text-sm">{request.user.services}</p>
                </div>
              )}
            </div>
          )}

          {/* Request Notes */}
          {request.notes && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground">
                Request Notes
              </h5>
              <p className="text-sm">{request.notes}</p>
            </div>
          )}

          {/* Verification Notes */}
          {showNotes && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">
                Verification Notes (Optional)
              </h5>
              <Textarea
                placeholder="Add any notes about this verification..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={() => handleVerification("approve")}
              disabled={processing}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {processing ? "Processing..." : "Approve"}
            </Button>

            <Button
              onClick={() => handleVerification("reject")}
              disabled={processing}
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              {processing ? "Processing..." : "Reject"}
            </Button>

            <Button
              onClick={() => setShowNotes(!showNotes)}
              size="sm"
              variant="ghost"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {showNotes ? "Hide Notes" : "Add Notes"}
            </Button>
          </div>

          {isLeadContact && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
              <strong>Lead Contact:</strong> You can approve this request
              directly, or wait for community verification (minimum 2
              verifications required).
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
