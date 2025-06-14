"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  formatMessageContent,
  getTimeUntilExpiration,
  getMessageAuthorName,
} from "@/lib/messages";
import type { MessageWithRelations } from "@/types/message";

interface DailyMessageWidgetProps {
  churchName: string;
}

interface ActiveMessagesResponse {
  messages: MessageWithRelations[];
  churchName: string;
  totalCount: number;
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

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/active?limit=3");

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data: ActiveMessagesResponse = await response.json();
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      console.error("Error fetching active messages:", err);
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Refresh messages every 5 minutes
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
          <div className="text-center py-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No active messages
            </p>
            <p className="text-xs text-muted-foreground">
              Your church hasn't posted any daily messages recently
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Daily Messages
        </CardTitle>
        <p className="text-sm text-muted-foreground">From {churchName}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {messages.map((message) => {
          const isExpanded = expandedMessages.has(message.id);
          const timeRemaining = getTimeUntilExpiration(message);
          const authorName = getMessageAuthorName(message);
          const contentPreview =
            message.content.length > 150
              ? message.content.substring(0, 150) + "..."
              : message.content;

          return (
            <div key={message.id} className="border rounded-lg p-3 space-y-2">
              {message.title && (
                <h4 className="font-medium text-sm">{message.title}</h4>
              )}

              <div className="text-sm text-foreground">
                {isExpanded ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content),
                    }}
                  />
                ) : (
                  <p>{contentPreview}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>By {authorName}</span>
                  {timeRemaining && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-amber-600">{timeRemaining}</span>
                      </div>
                    </>
                  )}
                </div>

                {message.content.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(message.id)}
                    className="h-auto p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex justify-between items-center pt-2">
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
  );
}
