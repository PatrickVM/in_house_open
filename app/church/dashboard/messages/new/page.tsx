import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import DailyMessageForm from "@/components/church/messages/DailyMessageForm";

export default async function NewMessagePage() {
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

  // Check if user can create more messages
  const existingMessages = await db.message.count({
    where: {
      churchId: church.id,
      status: { in: ["DRAFT", "SCHEDULED"] },
    },
  });

  const canCreateMore = existingMessages < 5; // MESSAGE_CONSTRAINTS.MAX_SCHEDULED_MESSAGES

  if (!canCreateMore) {
    redirect("/church/dashboard/messages?error=limit_reached");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/church/dashboard/messages">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Messages
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Create New Message
          </h1>
          <p className="text-muted-foreground">
            Share a daily message with your church community
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyMessageForm churchId={church.id} />
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Content Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Keep messages under 500 characters</li>
                <li>• Use **bold** and *italic* for emphasis</li>
                <li>• Add links: [text](url)</li>
                <li>• Include encouraging, uplifting content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Scheduling</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Messages expire after 24 hours</li>
                <li>• Schedule up to 5 messages at once</li>
                <li>• Publish immediately or schedule for later</li>
                <li>• Edit drafts and scheduled messages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
