"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Building2, MapPin, Calendar, User } from "lucide-react";

interface ItemModerationDialogProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    status: string;
    moderationStatus: string;
    moderationNotes: string | null;
    createdAt: Date;
    claimedAt: Date | null;
    church: {
      id: string;
      name: string;
      city: string;
      state: string;
    };
    claimer?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
}

export function ItemModerationDialog({ item }: ItemModerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [moderationStatus, setModerationStatus] = useState(
    item.moderationStatus
  );
  const [moderationNotes, setModerationNotes] = useState(
    item.moderationNotes || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moderationStatus,
          moderationNotes: moderationNotes.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update item");
      }

      const result = await response.json();
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update item"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 border-green-200 bg-green-50";
      case "PENDING":
        return "text-amber-600 border-amber-200 bg-amber-50";
      case "REJECTED":
        return "text-red-600 border-red-200 bg-red-50";
      default:
        return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-blue-600 border-blue-200 bg-blue-50";
      case "CLAIMED":
        return "text-purple-600 border-purple-200 bg-purple-50";
      case "COMPLETED":
        return "text-gray-600 border-gray-200 bg-gray-50";
      default:
        return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Moderate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Moderate Item</DialogTitle>
          <DialogDescription>
            Review and update the moderation status for this item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{item.title}</h4>
              <div className="flex gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(item.moderationStatus)}
                >
                  {item.moderationStatus}
                </Badge>
                <Badge
                  variant="outline"
                  className={getItemStatusColor(item.status)}
                >
                  {item.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                <span>{item.church.name}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  {item.church.city}, {item.church.state}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>Listed {item.createdAt.toLocaleDateString()}</span>
              </div>
              {item.claimer && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    Claimed by {item.claimer.firstName} {item.claimer.lastName}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600">
                <strong>Category:</strong> {item.category}
              </p>
              {item.description && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Description:</strong> {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Moderation Controls */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="moderationStatus">Moderation Status</Label>
              <Select
                value={moderationStatus}
                onValueChange={setModerationStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moderationNotes">Moderation Notes</Label>
              <Textarea
                id="moderationNotes"
                placeholder="Add notes about this moderation decision (optional for approvals, recommended for rejections)..."
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
