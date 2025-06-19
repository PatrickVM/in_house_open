"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Loader2, Users, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  createUserMessageSchema,
  type CreateUserMessageInput,
} from "@/lib/validators/message";
import {
  MESSAGE_CONSTRAINTS,
  USER_MESSAGE_CATEGORY_LABELS,
} from "@/types/message";
import { getUserMessageCategoryInfo } from "@/lib/messages";

interface MessageSharingFormProps {
  onSuccess?: () => void;
}

export default function MessageSharingForm({
  onSuccess,
}: MessageSharingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<CreateUserMessageInput>({
    resolver: zodResolver(createUserMessageSchema),
    defaultValues: {
      category: "TESTIMONY",
      isAnonymous: false,
      content: "",
    },
  });

  // Watch content for character count
  const content = watch("content");
  const category = watch("category");
  const isAnonymous = watch("isAnonymous");

  // Update character count when content changes
  React.useEffect(() => {
    setCharCount(content?.length || 0);
  }, [content]);

  const onSubmit = async (data: CreateUserMessageInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to share message");
      }

      toast.success("Message shared successfully!");
      reset();
      onSuccess?.();
      router.refresh(); // Refresh to show new message in widgets
    } catch (error) {
      console.error("Error sharing message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to share message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryInfo = getUserMessageCategoryInfo(category);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share with Your Church Community
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share testimonies, prayer requests, or special moments with your
          fellow church members
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              What would you like to share?
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(USER_MESSAGE_CATEGORY_LABELS).map(
                ([value, label]) => {
                  const info = getUserMessageCategoryInfo(value);
                  return (
                    <label
                      key={value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        category === value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register("category")}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <span
                          className="text-2xl"
                          role="img"
                          aria-label={label}
                        >
                          {info.icon}
                        </span>
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-muted-foreground">
                            {value === "TESTIMONY" &&
                              "Share how God has worked in your life"}
                            {value === "PRAYER_REQUEST" &&
                              "Ask your church family for prayer"}
                            {value === "GOD_WINK" &&
                              "Share a special moment or blessing"}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                }
              )}
            </div>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-base font-medium">
                Your Message
              </Label>
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
            <Textarea
              id="content"
              placeholder="Share your heart with your church family..."
              className="min-h-[120px] resize-none"
              {...register("content")}
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Messages are visible to your church members and expire after 24
              hours
            </p>
          </div>

          {/* Anonymous Toggle */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Privacy Options</Label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!isAnonymous}
                  onChange={() => setValue("isAnonymous", false)}
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">Share with my name</div>
                    <div className="text-sm text-muted-foreground">
                      Post will show your name to church members
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  checked={isAnonymous}
                  onChange={() => setValue("isAnonymous", true)}
                  disabled={isSubmitting}
                />
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Share anonymously</div>
                    <div className="text-sm text-muted-foreground">
                      Post will show as "Fellow Member"
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          {content && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Preview:
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${categoryInfo.color} inline-flex items-center gap-1`}
                  >
                    <span role="img" aria-label={categoryInfo.label}>
                      {categoryInfo.icon}
                    </span>
                    <span>{categoryInfo.label}</span>
                  </Badge>
                </div>
                <p className="text-sm">{content}</p>
                <div className="text-xs text-muted-foreground">
                  Posted by {isAnonymous ? "Fellow Member" : "You"} • Just now
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !content ||
                charCount > MESSAGE_CONSTRAINTS.MAX_CONTENT_LENGTH
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Sharing..." : "Share Message"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
