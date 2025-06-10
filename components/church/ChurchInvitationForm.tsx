"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  churchInvitationSchema,
  type ChurchInvitationInput,
} from "@/lib/validators/church-invitation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Link as LinkIcon,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ChurchInvitationFormProps {
  userEmail: string;
  userName: string;
  userPhone?: string;
}

export default function ChurchInvitationForm({
  userEmail,
  userName,
  userPhone,
}: ChurchInvitationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingInvitation, setExistingInvitation] = useState<string | null>(
    null
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChurchInvitationInput>({
    resolver: zodResolver(churchInvitationSchema),
  });

  const churchEmail = watch("churchEmail");

  // Check for existing invitation when email changes
  const checkExistingInvitation = async (email: string) => {
    if (!email || !email.includes("@")) return;

    try {
      const response = await fetch(
        `/api/church-invitations/check?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.exists) {
        setExistingInvitation(data.status);
      } else {
        setExistingInvitation(null);
      }
    } catch (error) {
      console.error("Error checking existing invitation:", error);
    }
  };

  // Debounced check for existing invitations
  useState(() => {
    const timeoutId = setTimeout(() => {
      if (churchEmail) {
        checkExistingInvitation(churchEmail);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  });

  const onSubmit = async (data: ChurchInvitationInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/church-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      toast.success("Church invitation sent successfully!");
      router.push("/invite-church/success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send invitation";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Send Church Invitation
        </CardTitle>
        <CardDescription className="text-center">
          Invite a church to join our community and connect with their members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info Preview */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Your invitation will include:
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>{userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{userEmail}</span>
            </div>
            {userPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{userPhone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3 w-3 text-muted-foreground" />
              <span>Registration link for church setup</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="churchEmail">Church Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="churchEmail"
                type="email"
                placeholder="pastor@churchname.org"
                {...register("churchEmail")}
                className={`pl-10 ${errors.churchEmail ? "border-destructive" : ""}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.churchEmail && (
              <p className="text-sm text-destructive">
                {errors.churchEmail.message}
              </p>
            )}

            {existingInvitation && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {existingInvitation === "PENDING" && (
                    <span className="text-amber-600">
                      A pending invitation has already been sent to this email
                      address.
                    </span>
                  )}
                  {existingInvitation === "CLAIMED" && (
                    <span className="text-green-600">
                      This church has already joined InHouse.
                    </span>
                  )}
                  {existingInvitation === "EXPIRED" && (
                    <span className="text-muted-foreground">
                      A previous invitation to this email has expired. You can
                      send a new one.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Personal Message (Optional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="customMessage"
                placeholder="Add a personal message to introduce the church to InHouse..."
                rows={4}
                {...register("customMessage")}
                className={`pl-10 resize-none ${errors.customMessage ? "border-destructive" : ""}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.customMessage && (
              <p className="text-sm text-destructive">
                {errors.customMessage.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This message will be included in the invitation email.
            </p>
          </div>

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                existingInvitation === "PENDING" ||
                existingInvitation === "CLAIMED"
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending invitation...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSubmitError(null);
                setExistingInvitation(null);
              }}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t pt-6">
        <div className="w-full space-y-4">
          <h3 className="font-semibold text-center text-foreground">
            How it works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="pt-1">
                <p className="font-medium text-sm">Send invitation</p>
                <p className="text-sm text-muted-foreground">
                  We'll email the church with your contact information and a
                  link to join InHouse.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div className="pt-1">
                <p className="font-medium text-sm">Church registers</p>
                <p className="text-sm text-muted-foreground">
                  They'll create an account and submit their church application.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div className="pt-1">
                <p className="font-medium text-sm">Admin approval</p>
                <p className="text-sm text-muted-foreground">
                  Our team reviews and approves their church profile.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <div className="pt-1">
                <p className="font-medium text-sm">Church goes live</p>
                <p className="text-sm text-muted-foreground">
                  They can start managing their congregation and sharing
                  resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
