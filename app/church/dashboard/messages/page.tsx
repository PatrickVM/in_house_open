import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Clock } from "lucide-react";

export default async function DailyMessagesPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Messages</h1>
          <p className="text-muted-foreground">
            Broadcast daily messages to your community members
          </p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Create Message
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">
            Daily Messages Coming Soon
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            This feature will allow you to broadcast daily messages to community
            members connected to your church. Messages will be visible for 24
            hours and help you stay connected with your community.
          </p>

          <div className="bg-muted p-4 rounded-lg max-w-md">
            <h4 className="font-medium mb-2">Planned Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create daily messages for your community</li>
              <li>• Messages automatically expire after 24 hours</li>
              <li>• Reach all users connected to your church</li>
              <li>• Schedule messages in advance</li>
              <li>• View message engagement statistics</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Active Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Currently broadcasting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Messages sent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Community Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Connected community members
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
