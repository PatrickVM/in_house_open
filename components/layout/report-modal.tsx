"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Bug, Lightbulb, MessageSquare } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [reportType, setReportType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const reportTypes = [
    {
      value: "bug",
      label: "Bug Report",
      icon: Bug,
      description: "Something isn't working correctly",
    },
    {
      value: "suggestion",
      label: "Suggestion",
      icon: Lightbulb,
      description: "Ideas for improvements or new features",
    },
    {
      value: "comment",
      label: "General Comment",
      icon: MessageSquare,
      description: "Feedback or general thoughts",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportType || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUrl = `${window.location.origin}${pathname}`;

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: reportType,
          description: description.trim(),
          pageUrl: currentUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit report");
      }

      toast.success(
        "Report submitted successfully! Thank you for your feedback."
      );

      // Reset form and close modal
      setReportType("");
      setDescription("");
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit report";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReportType("");
      setDescription("");
      onClose();
    }
  };

  if (!session) {
    return null; // Don't render if user is not authenticated
  }

  // Find the selected report type for custom display
  const selectedReportType = reportTypes.find(
    (type) => type.value === reportType
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Submit Report
          </DialogTitle>
          <DialogDescription>
            Help us improve InHouse by reporting bugs, suggesting features, or
            sharing feedback.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select
              value={reportType}
              onValueChange={setReportType}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type">
                  {selectedReportType && (
                    <div className="flex items-center gap-2">
                      <selectedReportType.icon className="h-4 w-4" />
                      <span>{selectedReportType.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue, suggestion, or feedback in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {description.length}/500 characters (minimum 10 required)
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Report will include:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Current page: {pathname}</li>
              <li>• Your user information</li>
              <li>• Timestamp</li>
            </ul>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !reportType ||
                !description.trim() ||
                description.length < 10
              }
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
