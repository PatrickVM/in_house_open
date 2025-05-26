import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get church details
    const church = await db.church.findUnique({
      where: { id },
      include: {
        leadContact: true,
        items: {
          include: {
            claimer: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    return NextResponse.json({ church });
  } catch (error) {
    console.error("Error fetching church details:", error);
    return NextResponse.json(
      { error: "Failed to fetch church details" },
      { status: 500 }
    );
  }
}
