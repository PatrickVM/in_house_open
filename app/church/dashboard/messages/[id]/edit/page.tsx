import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import DailyMessageForm from "@/components/church/messages/DailyMessageForm";

interface EditMessagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMessagePage({
  params,
}: EditMessagePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  const { id } = await params;

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

  // Get the message
  const message = await db.message.findFirst({
    where: {
      id,
      churchId: church.id, // Ensure user can only edit their church's messages
    },
  });

  if (!message) {
    notFound();
  }

  // Check if message can be edited (only drafts and scheduled)
  if (message.status !== "DRAFT" && message.status !== "SCHEDULED") {
    redirect("/church/dashboard/messages");
  }

  const initialData = {
    id: message.id,
    title: message.title || "",
    content: message.content,
    messageType: message.messageType as "DAILY_MESSAGE" | "ANNOUNCEMENT",
    scheduledFor: message.scheduledFor,
  };

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
          <h1 className="text-2xl font-bold text-foreground">Edit Message</h1>
          <p className="text-muted-foreground">Update your daily message</p>
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
          <DailyMessageForm
            churchId={church.id}
            initialData={initialData}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
