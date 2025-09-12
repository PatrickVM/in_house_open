"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowRight, Mail, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AccountDisabledContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const email = searchParams.get("email");

  const getDisabledInfo = () => {
    switch (reason) {
      case "CHURCH_MEMBERSHIP_REQUIRED":
        return {
          title: "Church Membership Required",
          description:
            "Your account has been temporarily disabled because you need to be a verified member of a church to access the platform.",
          steps: [
            "Search for and request to join a church below",
            "Wait for church members to verify your request",
            "Your account will be automatically reactivated once verified",
          ],
        };
      default:
        return {
          title: "Account Temporarily Disabled",
          description: "Your account has been temporarily disabled.",
          steps: ["Contact support for assistance"],
        };
    }
  };

  const info = getDisabledInfo();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{info.title}</CardTitle>
          <p className="text-muted-foreground">{info.description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Steps to Reactivate:</h3>
            <ol className="space-y-2">
              {info.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-sm rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {reason === "CHURCH_MEMBERSHIP_REQUIRED" && (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard/churches">
                  <Search className="w-4 h-4 mr-2" />
                  Search for Churches
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/church/apply">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Register Your Church
                </Link>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Need help? Contact support:
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="mailto:support@inhouse-app.com">
                <Mail className="w-4 h-4 mr-2" />
                support@inhouse-app.com
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}