"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ApplicationActionsProps {
  applicationId: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
}

export function ApplicationActions({
  applicationId,
  currentLatitude,
  currentLongitude,
}: ApplicationActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  // Form state
  const [latitude, setLatitude] = useState(currentLatitude?.toString() || "");
  const [longitude, setLongitude] = useState(
    currentLongitude?.toString() || ""
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    if (!latitude || !longitude) {
      toast.error("Please enter both latitude and longitude coordinates");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid numeric coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve application");
      }

      toast.success("Application approved successfully!");
      router.refresh();
      router.push("/admin/applications");
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to approve application"
      );
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject application");
      }

      toast.success("Application rejected");
      router.refresh();
      router.push("/admin/applications");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reject application"
      );
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Application Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!action && (
          <div className="space-y-3">
            <Button
              onClick={() => setAction("approve")}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Application
            </Button>
            <Button
              onClick={() => setAction("reject")}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Application
            </Button>
          </div>
        )}

        {action === "approve" && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Set Church Location
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Enter the precise latitude and longitude coordinates for
                    this church. This will be used for the map display and
                    location-based features.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 38.440429"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Range: -90 to 90 (North/South)
                </p>
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -122.714055"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Range: -180 to 180 (East/West)
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important:</p>
                  <p>Approving this application will:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Change the application status to APPROVED</li>
                    <li>Update the user's role to CHURCH</li>
                    <li>Set the church's coordinates for map display</li>
                    <li>Allow the church to list items</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Approving..." : "Confirm Approval"}
              </Button>
              <Button
                onClick={() => setAction(null)}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {action === "reject" && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">
                    Reject Application
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Please provide a clear reason for rejection. This will help
                    the applicant understand what needs to be addressed.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific and constructive in your feedback.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={isSubmitting}
                variant="destructive"
                className="flex-1"
              >
                {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
              <Button
                onClick={() => setAction(null)}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
