import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const joinRequestSchema = z.object({
  churchId: z.string().min(1, "Church ID is required"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joinRequestSchema.parse(body);

    // Check if user is already a member of any church
    const existingUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        churchId: true,
        churchMembershipStatus: true,
      },
    });

    if (existingUser?.churchId) {
      return NextResponse.json(
        { error: "You are already a member of a church" },
        { status: 400 }
      );
    }

    // Check if church exists and is approved
    const church = await db.church.findUnique({
      where: { id: validatedData.churchId },
      select: {
        id: true,
        name: true,
        applicationStatus: true,
        requiresVerification: true,
        minVerificationsRequired: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (church.applicationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Church is not approved" },
        { status: 400 }
      );
    }

    // Check if user already has a pending request for this church
    const existingRequest = await db.churchVerificationRequest.findUnique({
      where: {
        userId_churchId: {
          userId: session.user.id,
          churchId: validatedData.churchId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this church" },
        { status: 400 }
      );
    }

    // Create verification request
    const verificationRequest = await db.churchVerificationRequest.create({
      data: {
        userId: session.user.id,
        churchId: validatedData.churchId,
        requesterId: session.user.id,
        notes: validatedData.notes,
        status: "PENDING",
      },
    });

    // Update user status
    await db.user.update({
      where: { id: session.user.id },
      data: {
        churchMembershipStatus: "REQUESTED",
        churchJoinRequestedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Join request submitted successfully",
      request: verificationRequest,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating join request:", error);
    return NextResponse.json(
      { error: "Failed to create join request" },
      { status: 500 }
    );
  }
}
