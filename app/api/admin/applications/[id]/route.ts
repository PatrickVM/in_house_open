import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { action, latitude, longitude, rejectionReason } =
      await request.json();

    // Validate action
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the application
    const application = await db.church.findUnique({
      where: { id: resolvedParams.id },
      include: {
        leadContact: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    // Check if application is still pending
    if (application.applicationStatus !== "PENDING") {
      return NextResponse.json(
        { message: "Application has already been processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Validate coordinates for approval
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return NextResponse.json(
          {
            message:
              "Valid latitude and longitude coordinates are required for approval",
          },
          { status: 400 }
        );
      }

      if (latitude < -90 || latitude > 90) {
        return NextResponse.json(
          { message: "Latitude must be between -90 and 90" },
          { status: 400 }
        );
      }

      if (longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { message: "Longitude must be between -180 and 180" },
          { status: 400 }
        );
      }

      // Use transaction to ensure data consistency
      await db.$transaction(async (tx) => {
        // Update church application
        await tx.church.update({
          where: { id: resolvedParams.id },
          data: {
            applicationStatus: "APPROVED",
            latitude: latitude,
            longitude: longitude,
            updatedAt: new Date(),
          },
        });

        // Update user role to CHURCH
        await tx.user.update({
          where: { id: application.leadContactId },
          data: {
            role: "CHURCH",
            updatedAt: new Date(),
          },
        });
      });

      return NextResponse.json({
        message: "Application approved successfully",
        status: "APPROVED",
      });
    } else if (action === "reject") {
      // Validate rejection reason
      if (
        !rejectionReason ||
        typeof rejectionReason !== "string" ||
        !rejectionReason.trim()
      ) {
        return NextResponse.json(
          { message: "Rejection reason is required" },
          { status: 400 }
        );
      }

      // Update church application with rejection
      await db.church.update({
        where: { id: resolvedParams.id },
        data: {
          applicationStatus: "REJECTED",
          rejectionReason: rejectionReason.trim(),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Application rejected",
        status: "REJECTED",
      });
    }
  } catch (error) {
    console.error("Error processing application:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET method to fetch application details (optional, for future use)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const application = await db.church.findUnique({
      where: { id: resolvedParams.id },
      include: {
        leadContact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
