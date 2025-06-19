import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import MessageCategoryIcon from "@/components/user/MessageCategoryIcon";
import MemberPostDeleteButton from "@/components/church/messages/MemberPostDeleteButton";
import {
  getMessageAuthorName,
  formatMessageContent,
  getRelativeTime,
} from "@/lib/messages";
import type { Message } from "@/types/message";

type MemberPost = Message & {
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

export default async function MemberPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "CHURCH") {
    redirect("/login");
  }

  // Get church lead contact information
  const church = await db.church.findFirst({
    where: { leadContactId: session.user.id },
    include: {
      leadContact: true,
    },
  });

  if (!church) {
    redirect("/dashboard");
  }

  // Get all user messages for this church
  const memberPosts = (await db.message.findMany({
    where: {
      churchId: church.id,
      messageType: "USER_SHARE",
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as MemberPost[];

  const activePosts = memberPosts.filter(
    (post) =>
      post.status === "PUBLISHED" &&
      post.expiresAt &&
      new Date(post.expiresAt) > new Date()
  );

  const expiredPosts = memberPosts.filter(
    (post) =>
      post.status === "PUBLISHED" &&
      post.expiresAt &&
      new Date(post.expiresAt) <= new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/church/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Member Posts</h1>
            <p className="text-muted-foreground">
              Messages shared by members of {church.name}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Posts</p>
                  <p className="text-2xl font-bold">{activePosts.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{memberPosts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired Posts</p>
                  <p className="text-2xl font-bold">{expiredPosts.length}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Posts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Active Posts ({activePosts.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Currently visible to church members
            </p>
          </CardHeader>
          <CardContent>
            {activePosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active member posts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePosts.map((post) => (
                  <div
                    key={post.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {post.category && (
                          <MessageCategoryIcon
                            category={post.category}
                            size="sm"
                          />
                        )}
                        <div className="text-sm">
                          <span className="font-medium">
                            {getMessageAuthorName(
                              {
                                ...post,
                                createdBy: {
                                  ...post.createdBy,
                                  firstName: post.createdBy.firstName ?? null,
                                  lastName: post.createdBy.lastName ?? null,
                                },
                              },
                              "CHURCH",
                              true
                            )}
                          </span>
                          {post.isAnonymous && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Posted Anonymously
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(post.createdAt)}
                        </span>
                        <MemberPostDeleteButton messageId={post.id} />
                      </div>
                    </div>

                    {/* Post Content */}
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatMessageContent(post.content),
                      }}
                    />

                    {/* Post Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>
                        Expires{" "}
                        {post.expiresAt &&
                          new Date(post.expiresAt).toLocaleDateString()}
                      </span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expired Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-gray-600" />
              </div>
              Recent Expired Posts ({Math.min(expiredPosts.length, 10)})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 10 expired posts from your members
            </p>
          </CardHeader>
          <CardContent>
            {expiredPosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No expired posts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expiredPosts.slice(0, 10).map((post) => (
                  <div
                    key={post.id}
                    className="border rounded-lg p-4 space-y-3 opacity-75"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {post.category && (
                          <MessageCategoryIcon
                            category={post.category}
                            size="sm"
                          />
                        )}
                        <div className="text-sm">
                          <span className="font-medium">
                            {getMessageAuthorName(
                              {
                                ...post,
                                createdBy: {
                                  ...post.createdBy,
                                  firstName: post.createdBy.firstName ?? null,
                                  lastName: post.createdBy.lastName ?? null,
                                },
                              },
                              "CHURCH",
                              true
                            )}
                          </span>
                          {post.isAnonymous && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Posted Anonymously
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(post.createdAt)}
                      </span>
                    </div>

                    {/* Post Content (Truncated) */}
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {post.content.length > 150
                        ? post.content.substring(0, 150) + "..."
                        : post.content}
                    </div>

                    {/* Post Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>
                        Expired{" "}
                        {post.expiresAt &&
                          new Date(post.expiresAt).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">Expired</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
