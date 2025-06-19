"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MessageCategoryIcon from "@/components/user/MessageCategoryIcon";
import MessageSharingForm from "@/components/user/MessageSharingForm";
import {
  formatMessageContent,
  getMessageAuthorName,
  getTimeUntilExpiration,
} from "@/lib/messages";
import type { MessageWithRelations } from "@/types/message";
import { MESSAGE_TYPE_LABELS } from "@/types/message";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DailyMessageWidgetProps {
  churchName: string;
}

export default function DailyMessageWidget({
  churchName,
}: DailyMessageWidgetProps) {
  const [messages, setMessages] = useState<MessageWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set()
  );
  const [showShareForm, setShowShareForm] = useState(false);

  const fetchMessages = async () => {
    try {
      setError(null);
      const response = await fetch("/api/messages/active");

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMessages, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpanded = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const getMessageTypeDisplay = (messageType: string, category?: string) => {
    if (messageType === "USER_SHARE" && category) {
      return <MessageCategoryIcon category={category} size="sm" />;
    }

    return (
      <Badge variant="outline" className="text-xs">
        {MESSAGE_TYPE_LABELS[messageType as keyof typeof MESSAGE_TYPE_LABELS] ||
          messageType}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Daily Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Daily Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Unable to load messages
            </p>
            <Button variant="outline" size="sm" onClick={fetchMessages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Daily Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No active messages
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Your church hasn't posted any messages recently
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowShareForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Share Something
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Daily Messages
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowShareForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Share
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">From {churchName}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => {
              const isExpanded = expandedMessages.has(message.id);
              const authorName = getMessageAuthorName({
                ...message,
                createdBy: {
                  ...message.createdBy,
                  firstName: message.createdBy.firstName ?? null,
                  lastName: message.createdBy.lastName ?? null,
                },
              });
              const timeRemaining = getTimeUntilExpiration(message);
              const shouldTruncate = message.content.length > 150;
              const displayContent =
                shouldTruncate && !isExpanded
                  ? message.content.substring(0, 150) + "..."
                  : message.content;

              return (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Message Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getMessageTypeDisplay(
                        message.messageType,
                        message.category
                      )}
                      {message.title && (
                        <h4 className="font-medium text-sm truncate">
                          {message.title}
                        </h4>
                      )}
                    </div>
                    {shouldTruncate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(message.id)}
                        className="h-auto p-1 flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(displayContent),
                    }}
                  />

                  {/* Message Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>By {authorName}</span>
                      {timeRemaining && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-amber-600">
                              {timeRemaining}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={fetchMessages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <p className="text-xs text-muted-foreground">
              Updates every 5 minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Message Sharing Modal/Form */}
      {showShareForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Share with Your Church</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareForm(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <MessageSharingForm
                onSuccess={() => {
                  setShowShareForm(false);
                  fetchMessages(); // Refresh messages after successful share
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
