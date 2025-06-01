import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  churchId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createItemSchema.parse(body);

    // Verify the user is the lead contact for this church
    const church = await db.church.findFirst({
      where: {
        id: validatedData.churchId,
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json(
        { message: "Church not found or unauthorized" },
        { status: 403 }
      );
    }

    // For now, we'll use placeholder coordinates
    // In a real implementation, you'd geocode the address
    const latitude = 40.7128; // Default to NYC coordinates
    const longitude = -74.006;

    // Create the item
    const item = await db.item.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        category: validatedData.category,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        latitude,
        longitude,
        churchId: validatedData.churchId,
        status: "AVAILABLE",
        moderationStatus: "APPROVED", // Churches can post directly without moderation
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CHURCH") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the church associated with this user
    const church = await db.church.findFirst({
      where: {
        leadContactId: session.user.id,
        applicationStatus: "APPROVED",
      },
    });

    if (!church) {
      return NextResponse.json(
        { message: "Church not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const moderation = searchParams.get("moderation");

    // Build where clause
    const whereClause: any = {
      churchId: church.id,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (moderation && moderation !== "all") {
      whereClause.moderationStatus = moderation;
    }

    // Get items
    const items = await db.item.findMany({
      where: whereClause,
      include: {
        claimer: {
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
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
