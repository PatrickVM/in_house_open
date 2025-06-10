import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ArrowLeft, AlertTriangle, Clock, Building, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ChurchSignupFlow from "@/components/church/ChurchSignupFlow";

interface ChurchSignupPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ChurchSignupPage({
  params,
}: ChurchSignupPageProps) {
  const { token } = await params;

  // Validate and get invitation
  const invitation = await db.churchInvitation.findUnique({
    where: { id: token },
    include: {
      inviter: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    notFound();
  }

  // Check if invitation is expired
  const now = new Date();
  const isExpired = invitation.expiresAt < now;

  // Check if invitation is already claimed
  const isAlreadyClaimed = invitation.status === "CLAIMED";

  // Update status to EXPIRED if needed
  if (isExpired && invitation.status === "PENDING") {
    await db.churchInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
  }

  const inviterName =
    invitation.inviter.firstName && invitation.inviter.lastName
      ? `${invitation.inviter.firstName} ${invitation.inviter.lastName}`
      : invitation.inviter.email;

  // Error states with centered card layout
  if (isExpired || isAlreadyClaimed) {
    return (
      <div className="container flex items-center justify-center py-10 md:py-20">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                {isExpired ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <Clock className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold">
                {isExpired ? "Invitation Expired" : "Already Used"}
              </CardTitle>
              <CardDescription>
                {isExpired
                  ? "This invitation link has expired and is no longer valid."
                  : "This invitation has already been used to create an account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert
                className={
                  isExpired
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
                }
              >
                <AlertDescription
                  className={isExpired ? "text-red-800" : "text-blue-800"}
                >
                  {isExpired ? (
                    <div className="space-y-2">
                      <p>
                        This invitation expired on{" "}
                        <strong>
                          {invitation.expiresAt.toLocaleDateString()}
                        </strong>
                        .
                      </p>
                      <p>
                        Please contact <strong>{inviterName}</strong> at{" "}
                        <strong>{invitation.inviter.email}</strong> to request a
                        new invitation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>
                        Someone has already registered using this invitation
                        link.
                      </p>
                      <p>
                        If this was you, you can{" "}
                        <Link href="/login" className="font-medium underline">
                          sign in here
                        </Link>
                        .
                      </p>
                      <p>
                        If you need a new invitation, please contact{" "}
                        <strong>{inviterName}</strong> at{" "}
                        <strong>{invitation.inviter.email}</strong>.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Link>
                </Button>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Valid invitation - show signup flow
  return (
    <div className="min-h-screen bg-background">
      {/* Header with branding */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>

            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">
                Church Registration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome header */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Join InHouse as a Church
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete your registration and church application to connect with
            your community and manage your congregation.
          </p>
        </div>

        {/* Invitation info card */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    You've been invited by {inviterName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact: {invitation.inviter.email}
                  </p>
                  {invitation.customMessage && (
                    <div className="bg-card border rounded-lg p-4 mt-4">
                      <p className="text-sm text-muted-foreground italic">
                        "{invitation.customMessage}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signup flow */}
        <div className="max-w-4xl mx-auto">
          <ChurchSignupFlow
            token={token}
            inviterName={inviterName}
            inviterEmail={invitation.inviter.email}
            customMessage={invitation.customMessage || undefined}
          />
        </div>
      </div>
    </div>
  );
}
