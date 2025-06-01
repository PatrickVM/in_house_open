import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateChurchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate the input data
    const validatedData = updateChurchSchema.parse(body);

    // Check if church exists and is approved
    const existingChurch = await db.church.findUnique({
      where: { id },
    });

    if (!existingChurch) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (existingChurch.applicationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Can only update coordinates for approved churches" },
        { status: 400 }
      );
    }

    // Update church coordinates
    const updatedChurch = await db.church.update({
      where: { id },
      data: {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        updatedAt: new Date(),
      },
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

    return NextResponse.json({
      message: "Church coordinates updated successfully",
      church: updatedChurch,
    });
  } catch (error) {
    console.error("Error updating church coordinates:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update church coordinates" },
      { status: 500 }
    );
  }
}
