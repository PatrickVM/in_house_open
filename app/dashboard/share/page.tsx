import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MessageSharingForm from "@/components/user/MessageSharingForm";

export default async function ShareMessagePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get user with church information
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      church: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Only verified church members can share messages
  if (user.churchMembershipStatus !== "VERIFIED" || !user.church) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Sharing Not Available
                </h2>
                <p className="text-muted-foreground">
                  Only verified church members can share messages with their
                  community.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Share with Your Church</h1>
            <p className="text-muted-foreground">
              Share testimonies, prayer requests, and special moments with{" "}
              {user.church.name}
            </p>
          </div>
        </div>

        {/* Message Sharing Form */}
        <Suspense
          fallback={
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <MessageSharingForm />
        </Suspense>

        {/* Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Sharing Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">🙏 Testimonies</h4>
                <p className="text-muted-foreground">
                  Share how God has worked in your life, answered prayers, or
                  shown His faithfulness.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-purple-600">
                  💭 Prayer Requests
                </h4>
                <p className="text-muted-foreground">
                  Ask your church family to pray for specific needs, challenges,
                  or situations.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">✨ God Winks</h4>
                <p className="text-muted-foreground">
                  Share special moments, unexpected blessings, or divine
                  encounters.
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Remember:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Messages are visible to all verified members of{" "}
                  {user.church.name}
                </li>
                <li>All posts automatically expire after 24 hours</li>
                <li>You can choose to post anonymously or with your name</li>
                <li>
                  Keep messages encouraging, respectful, and appropriate for all
                  ages
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
