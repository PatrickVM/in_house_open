"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Eye, Clock, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getUserMessageCategoryInfo } from "@/lib/messages";

interface MessageCardProps {
  message: {
    id: string;
    content: string;
    messageType: "DAILY_MESSAGE" | "ANNOUNCEMENT" | "USER_SHARE";
    status: string;
    title?: string;
    category?: "TESTIMONY" | "PRAYER_REQUEST" | "GOD_WINK";
    isAnonymous: boolean;
    scheduledFor?: string | Date;
    publishedAt?: string | Date;
    expiresAt?: string | Date;
    createdAt: string | Date;
    createdBy: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    church: {
      name: string;
      city: string;
      state: string;
    };
  };
}

export default function MessageCard({ message }: MessageCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const isUserMessage = message.messageType === "USER_SHARE";
  const isChurchMessage = ["DAILY_MESSAGE", "ANNOUNCEMENT"].includes(
    message.messageType
  );

  // Message type display
  const getMessageTypeDisplay = () => {
    if (isUserMessage && message.category) {
      const categoryInfo = getUserMessageCategoryInfo(message.category);
      return {
        icon: categoryInfo.icon,
        label: categoryInfo.label,
        color: categoryInfo.color,
      };
    }

    if (message.messageType === "DAILY_MESSAGE") {
      return {
        icon: "📢",
        label: "Daily Message",
        color: "text-blue-600 border-blue-200",
      };
    }

    if (message.messageType === "ANNOUNCEMENT") {
      return {
        icon: "📣",
        label: "Announcement",
        color: "text-green-600 border-green-200",
      };
    }

    return {
      icon: "💬",
      label: "Message",
      color: "text-gray-600 border-gray-200",
    };
  };

  // Status display
  const getStatusInfo = () => {
    const now = new Date();

    if (message.status === "SCHEDULED") {
      return { label: "Scheduled", color: "text-purple-600 border-purple-200" };
    }

    if (message.status === "PUBLISHED" && message.expiresAt) {
      const expiresAt = new Date(message.expiresAt);
      if (expiresAt <= now) {
        return { label: "Expired", color: "text-gray-600 border-gray-200" };
      } else {
        const hoursUntilExpiry = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        return {
          label: `Expires in ${hoursUntilExpiry}h`,
          color: "text-amber-600 border-amber-200",
        };
      }
    }

    return { label: message.status, color: "text-gray-600 border-gray-200" };
  };

  // Content display
  const shouldTruncate = message.content.length > 100;
  const displayContent =
    shouldTruncate && !showFullContent
      ? message.content.substring(0, 100) + "..."
      : message.content;

  // Author display
  const authorName =
    `${message.createdBy.firstName || ""} ${message.createdBy.lastName || ""}`.trim() ||
    "Unknown User";
  const isAnonymousPost = isUserMessage && message.isAnonymous;

  // Delete confirmation dialog content
  const getDeleteDialogContent = () => {
    if (isChurchMessage) {
      return {
        title: "Delete Church Message?",
        description: `This will remove the ${message.messageType.toLowerCase().replace("_", " ")} from all church members' feeds.`,
        details: [`Church: ${message.church.name}`, `Posted by: ${authorName}`],
      };
    } else {
      return {
        title: "Delete User Message?",
        description:
          "This will remove the personal message from the church community.",
        details: [
          `Posted by: ${authorName} from ${message.church.name}`,
          `Category: ${getMessageTypeDisplay().label}`,
        ],
      };
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete message");
      }

      toast.success("Message deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const typeDisplay = getMessageTypeDisplay();
  const statusInfo = getStatusInfo();
  const deleteDialog = getDeleteDialogContent();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={`${typeDisplay.color} inline-flex items-center gap-1`}
              >
                <span role="img" aria-label={typeDisplay.label}>
                  {typeDisplay.icon}
                </span>
                <span>{typeDisplay.label}</span>
              </Badge>

              {isAnonymousPost && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-200"
                >
                  Anonymous Post
                </Badge>
              )}

              <Badge variant="outline" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>

              {message.title && (
                <h4 className="font-medium text-white">{message.title}</h4>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{deleteDialog.title}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteDialog.description}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  {deleteDialog.details.map((detail, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Message"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Author & Church Info */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{authorName}</span>
              <span className="text-gray-500">({message.createdBy.email})</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{message.church.name}</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-gray-200 leading-relaxed">{displayContent}</p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-400 hover:text-blue-300 p-0 h-auto"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showFullContent ? "Show Less" : "View Full"}
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>
                Posted {new Date(message.createdAt).toLocaleDateString()}
              </span>
              {message.scheduledFor && (
                <>
                  <span>•</span>
                  <span>
                    Scheduled for{" "}
                    {new Date(message.scheduledFor).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
