import { authOptions } from "@/auth";
import { getAdminMessages } from "@/lib/admin-messages";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Use shared query logic
    const data = await getAdminMessages({
      messageType: searchParams.get("messageType") || undefined,
      church: searchParams.get("church") || undefined,
      status: searchParams.get("status") || undefined,
      dateRange: searchParams.get("dateRange") || undefined,
      category: searchParams.get("category") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching admin messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
