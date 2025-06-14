"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Send, Save, Loader2 } from "lucide-react";
import {
  createMessageSchema,
  type CreateMessageInput,
} from "@/lib/validators/message";
import { MESSAGE_CONSTRAINTS } from "@/types/message";
import MessageScheduler from "./MessageScheduler";

interface DailyMessageFormProps {
  churchId: string;
  initialData?: Partial<CreateMessageInput> & { id?: string };
  mode?: "create" | "edit";
}

export default function DailyMessageForm({
  churchId,
  initialData,
  mode = "create",
}: DailyMessageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string | undefined>(
    initialData?.scheduledFor
      ? new Date(initialData.scheduledFor).toISOString()
      : undefined
  );
  const [charCount, setCharCount] = useState(initialData?.content?.length || 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateMessageInput>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      messageType: initialData?.messageType || "DAILY_MESSAGE",
    },
  });

  // Watch content for character count
  const content = watch("content");
  const title = watch("title");

  // Update character count when content changes
  React.useEffect(() => {
    setCharCount(content?.length || 0);
  }, [content]);

  const onSubmit = async (data: CreateMessageInput) => {
    setIsSubmitting(true);

    try {
      // Prepare submission data with proper timezone handling
      const submitData = {
        ...data,
        scheduledFor: scheduledFor
          ? new Date(scheduledFor).toISOString()
          : undefined,
      };

      const url =
        mode === "edit" && initialData?.id
          ? `/api/church/messages/${initialData.id}`
          : "/api/church/messages";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save message");
      }

      // Redirect back to messages list
      router.push("/church/dashboard/messages");
      router.refresh();
    } catch (error) {
      console.error("Error saving message:", error);
      // TODO: Add proper error handling/toast
      alert(error instanceof Error ? error.message : "Failed to save message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const formData = {
      title: title || "",
      content: content || "",
      messageType: "DAILY_MESSAGE" as const,
      // Don't include scheduledFor for drafts
    };

    // Manually trigger form submission but force it to be a draft
    setIsSubmitting(true);

    try {
      const url =
        mode === "edit" && initialData?.id
          ? `/api/church/messages/${initialData.id}`
          : "/api/church/messages";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save draft");
      }

      router.push("/church/dashboard/messages");
      router.refresh();
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Message Title{" "}
          <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="title"
          placeholder="Enter a title for your message..."
          {...register("title")}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Message Content</Label>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                charCount > MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs"
            >
              {charCount}/{MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH}
            </Badge>
          </div>
        </div>
        <Textarea
          id="content"
          placeholder="Write your daily message here... (Markdown supported)"
          className="min-h-[120px] resize-none"
          {...register("content")}
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Supports basic Markdown formatting: **bold**, *italic*, `code`
        </p>
      </div>

      {/* Message Type */}
      <div className="space-y-2">
        <Label htmlFor="messageType">Message Type</Label>
        <select
          id="messageType"
          {...register("messageType")}
          disabled={isSubmitting}
          className="w-full p-2 border border-border rounded-md bg-background"
        >
          <option value="DAILY_MESSAGE">Daily Message</option>
          <option value="ANNOUNCEMENT">Announcement</option>
        </select>
        {errors.messageType && (
          <p className="text-sm text-red-600">{errors.messageType.message}</p>
        )}
      </div>

      {/* Message Scheduler */}
      <MessageScheduler
        value={scheduledFor}
        onChange={setScheduledFor}
        disabled={isSubmitting}
        error={errors.scheduledFor?.message}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={
            isSubmitting || charCount > MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH
          }
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : scheduledFor ? (
            <Send className="w-4 h-4 mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {isSubmitting
            ? "Saving..."
            : scheduledFor
              ? "Schedule Message"
              : "Publish Now"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={
            isSubmitting ||
            !content ||
            charCount > MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH
          }
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/church/dashboard/messages")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
