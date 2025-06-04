import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all approved churches
    const churches = await db.church.findMany({
      where: {
        applicationStatus: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
      },
      orderBy: [{ state: "asc" }, { city: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ churches });
  } catch (error) {
    console.error("Error fetching approved churches:", error);
    return NextResponse.json(
      { error: "Failed to fetch churches" },
      { status: 500 }
    );
  }
}
