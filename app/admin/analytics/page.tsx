import ContentTab from "@/components/admin/analytics/ContentTab";
import InvitationsTab from "@/components/admin/analytics/InvitationsTab";
import LeaderboardTab from "@/components/admin/analytics/LeaderboardTab";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClockIcon } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Analytics | Admin Dashboard",
  description: "Invitation analytics and metrics",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Monitor invitation activity, message content, and performance metrics
        </p>
      </div>

      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <Suspense fallback={<div>Loading invitations...</div>}>
            <InvitationsTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Suspense fallback={<div>Loading content analytics...</div>}>
            <ContentTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Suspense fallback={<div>Loading leaderboard...</div>}>
            <LeaderboardTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Detailed logs of invitation activities
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ClockIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-center">Coming Soon</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Invitation activity logs and audit trails will be available in a
                future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
