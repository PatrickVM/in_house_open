"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully!");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center" href="/">
          <span className="text-xl font-bold">In-House</span>
        </Link>
        <nav className="ml-auto flex gap-4 items-center">
          <Link
            href="/directory"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Directory
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Profile
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">
                  Please complete your profile to appear in the directory.
                </p>
                <Link href="/profile/edit">
                  <Button>Edit Profile</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invite Someone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">
                  Invite another person to join the community.
                </p>
                <Link href="/invite">
                  <Button>Generate Invite</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
