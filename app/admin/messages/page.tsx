import { authOptions } from "@/auth";
import MessageCard from "@/components/admin/messages/MessageCard";
import MessageFilters from "@/components/admin/messages/MessageFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminMessages } from "@/lib/admin-messages";
import {
  Building2,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    messageType?: string;
    church?: string;
    status?: string;
    dateRange?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  // Check authentication and admin role (following established pattern)
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/messages");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/"); // Redirect non-admin users to home
  }

  const resolvedSearchParams = await searchParams;

  // Parse query parameters with defaults
  const messageType = resolvedSearchParams.messageType || "all";
  const church = resolvedSearchParams.church || "all";
  const status = resolvedSearchParams.status || "all";
  const dateRange = resolvedSearchParams.dateRange || "7d";
  const category = resolvedSearchParams.category || "all";
  const page = parseInt(resolvedSearchParams.page || "1");

  // Direct database access using shared query logic (following established pattern)
  let data;
  try {
    data = await getAdminMessages({
      messageType,
      church,
      status,
      dateRange,
      category,
      page,
      limit: 20,
    });
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Messages</h1>
            <p className="text-gray-300">
              Error loading messages. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { messages, pagination, stats, churches } = data;

  // Generate pagination URLs
  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (messageType !== "all") params.set("messageType", messageType);
    if (church !== "all") params.set("church", church);
    if (status !== "all") params.set("status", status);
    if (dateRange !== "7d") params.set("dateRange", dateRange);
    if (category !== "all") params.set("category", category);
    if (newPage !== 1) params.set("page", newPage.toString());

    return `/admin/messages${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Messages</h1>
          <p className="text-gray-300">
            Monitor and manage all messages across the platform
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {pagination.totalItems} messages
        </div>
      </div>

      {/* Basic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Last 7 Days
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.last7Days.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Active Now
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.active.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              User Messages
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.userMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Church Messages
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.churchMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <MessageFilters churches={churches} />

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length > 0 ? (
          <>
            {messages.map((message: any) => (
              <MessageCard key={message.id} message={message} />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.totalItems
                      )}{" "}
                      of {pagination.totalItems} messages
                    </div>

                    <div className="flex items-center gap-2">
                      {pagination.hasPrev && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={createPageUrl(pagination.page - 1)}>
                            Previous
                          </Link>
                        </Button>
                      )}

                      <span className="text-sm text-gray-400">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>

                      {pagination.hasNext && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={createPageUrl(pagination.page + 1)}>
                            Next
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Messages Found
              </h3>
              <p className="text-gray-400 mb-4">
                No messages match your current filter criteria.
              </p>
              <Button asChild variant="outline">
                <Link href="/admin/messages">Clear Filters</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ENHANCEMENTS (Phase 2) */}
      {/* 
        ENHANCEMENT: Bulk Actions
        - Bulk delete messages from specific church
        - Bulk delete expired messages
        - Bulk approve user messages (if moderation added)

        ENHANCEMENT: Deletion Notifications  
        - Email church lead when their message is deleted
        - Notify user when their message is deleted with reason
        - Admin deletion reason requirement and logging

        ENHANCEMENT: Advanced Analytics
        - Message volume trends by church
        - Most active message creators
        - Content category distribution
        - Admin action audit trail

        ENHANCEMENT: Content Moderation
        - Flag inappropriate content workflow
        - Keyword filtering and alerts
        - User reporting system
        - Moderation queue for user messages
      */}
    </div>
  );
}
