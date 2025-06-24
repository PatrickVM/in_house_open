import ContentTab from "@/components/admin/analytics/ContentTab";
import InvitationsTab from "@/components/admin/analytics/InvitationsTab";
import LeaderboardTab from "@/components/admin/analytics/LeaderboardTab";
import ActivityLogsTab from "@/components/admin/analytics/ActivityLogsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
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
          <Suspense fallback={<div>Loading activity logs...</div>}>
            <ActivityLogsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
