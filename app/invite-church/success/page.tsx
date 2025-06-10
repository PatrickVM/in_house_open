import Link from "next/link";
import { CheckCircle, ArrowLeft, Mail, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InviteChurchSuccessPage() {
  return (
    <div className="container flex flex-col items-center justify-center py-10 md:py-20">
      <div className="w-full max-w-2xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </div>

        {/* Success Card */}
        <Card className="w-full">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                Invitation Sent Successfully!
              </CardTitle>
              <CardDescription className="text-lg">
                Your church invitation has been delivered. They'll receive an
                email with everything needed to join InHouse.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* What happens next section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-center">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="pt-1">
                    <p className="font-medium text-sm">Email delivered</p>
                    <p className="text-sm text-muted-foreground">
                      The church receives your invitation with a secure signup
                      link and your contact information.
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
                      They'll create an account and submit their church
                      application for review.
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
                      They can start managing their congregation and connecting
                      with members.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important note */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  Invitation expires in 7 days
                </p>
                <p className="text-sm text-muted-foreground">
                  If they don't respond within that time, you can send another
                  invitation.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
            <Button asChild className="flex-1">
              <Link href="/invite-church">
                <Mail className="mr-2 h-4 w-4" />
                Invite Another Church
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/profile">Return to Profile</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Support link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Questions about the invitation process?{" "}
            <Link
              href="/contact"
              className="font-medium text-primary hover:underline"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
