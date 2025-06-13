import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ChurchInvitationsTab from "@/components/church/analytics/ChurchInvitationsTab";
import ChurchMemberBoard from "@/components/church/analytics/ChurchMemberBoard";

export const metadata = {
  title: "Invitations | Church Dashboard",
  description: "View your church's invitation activity and member performance",
};

export default async function ChurchInvitationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get the church associated with this user
  const church = await db.church.findFirst({
    where: {
      leadContactId: session.user.id,
      applicationStatus: "APPROVED",
    },
  });

  if (!church) {
    redirect("/church/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          Monitor your church members' invitation activity and performance
        </p>
      </div>

      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="member-board">Member Board</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <Suspense fallback={<div>Loading invitations...</div>}>
            <ChurchInvitationsTab churchId={church.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="member-board" className="space-y-4">
          <Suspense fallback={<div>Loading member board...</div>}>
            <ChurchMemberBoard churchId={church.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
