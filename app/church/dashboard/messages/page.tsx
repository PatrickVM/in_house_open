import { authOptions } from "@/auth";
import MessageDeleteButton from "@/components/church/messages/MessageDeleteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  getMessageDisplayStatus,
  getRelativeTime,
  getTimeUntilExpiration,
} from "@/lib/messages";
import { MESSAGE_STATUS_LABELS } from "@/types/message";
import { Archive, Clock, Eye, MessageSquare, Plus, Send } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DailyMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get the church associated with this user
  const church = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
  });

  if (!church) {
    redirect("/church/dashboard");
  }

  // Get messages and statistics
  const [
    messages,
    totalMessages,
    activeMessages,
    scheduledMessages,
    draftMessages,
  ] = await Promise.all([
    db.message.findMany({
      where: {
        churchId: church.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Drafts first, then scheduled, then published
        { createdAt: "desc" },
      ],
      take: 20, // Limit for page load performance
    }),
    db.message.count({ where: { churchId: church.id } }),
    db.message.count({
      where: {
        churchId: church.id,
        status: "PUBLISHED",
        expiresAt: { gt: new Date() },
      },
    }),
    db.message.count({ where: { churchId: church.id, status: "SCHEDULED" } }),
    db.message.count({ where: { churchId: church.id, status: "DRAFT" } }),
  ]);

  const canCreateMore = draftMessages + scheduledMessages < 5; // MESSAGE_CONSTRAINTS.MAX_SCHEDULED_MESSAGES

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Messages</h1>
          <p className="text-muted-foreground">
            Share daily messages with your community members
          </p>
        </div>
        <Button asChild disabled={!canCreateMore}>
          <Link href="/church/dashboard/messages/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Message
          </Link>
        </Button>
      </div>

      {/* Constraint Warning */}
      {!canCreateMore && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Archive className="w-4 h-4" />
              <span className="text-sm font-medium">
                You have reached the limit of 5 scheduled/draft messages. Please
                publish or delete existing messages to create new ones.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <MessageSquare className="w-4 h-4 mr-2" />
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Eye className="w-4 h-4 mr-2" />
              Active Now
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">
              {activeMessages}
            </div>
            <p className="text-xs text-muted-foreground">Currently visible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {scheduledMessages}
            </div>
            <p className="text-xs text-muted-foreground">Future publication</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Send className="w-4 h-4 mr-2" />
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-amber-600">
              {draftMessages}
            </div>
            <p className="text-xs text-muted-foreground">Ready to publish</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => {
                const displayStatus = getMessageDisplayStatus(message);
                const createdByName =
                  message.createdBy.firstName && message.createdBy.lastName
                    ? `${message.createdBy.firstName} ${message.createdBy.lastName}`
                    : message.createdBy.email;

                return (
                  <div
                    key={message.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        {message.title && (
                          <h3 className="font-medium text-sm truncate">
                            {message.title}
                          </h3>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>By {createdByName}</span>
                          <span>•</span>
                          <span>{getRelativeTime(message.createdAt)}</span>
                          {message.publishedAt &&
                            displayStatus === "PUBLISHED" && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600">
                                  {getTimeUntilExpiration(message)}
                                </span>
                              </>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Badge
                          variant="outline"
                          className={
                            displayStatus === "PUBLISHED"
                              ? "text-green-600 border-green-200"
                              : displayStatus === "SCHEDULED"
                                ? "text-blue-600 border-blue-200"
                                : displayStatus === "DRAFT"
                                  ? "text-amber-600 border-amber-200"
                                  : "text-gray-600 border-gray-200"
                          }
                        >
                          {MESSAGE_STATUS_LABELS[displayStatus]}
                        </Badge>

                        {(displayStatus === "DRAFT" ||
                          displayStatus === "SCHEDULED") && (
                          <>
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/church/dashboard/messages/${message.id}/edit`}
                              >
                                Edit
                              </Link>
                            </Button>
                            <MessageDeleteButton
                              messageId={message.id}
                              messageTitle={message.title}
                              messageStatus={displayStatus}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first daily message to connect with your community
              </p>
              <Button asChild>
                <Link href="/church/dashboard/messages/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Message
                </Link>
              </Button>
            </div>
          )}

          {messages.length >= 20 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing latest 20 messages. Use filters for more options.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
