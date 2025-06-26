import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Simple security check - this should ideally be secured with a cron secret
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || "development-secret";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    // Find expired requests that haven't been processed yet
    const expiredRequests = await db.memberItemRequest.findMany({
      where: {
        status: "REQUESTED",
        expiresAt: {
          lte: new Date(),
        },
      },
      include: {
        item: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (expiredRequests.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired requests found",
        expiredCount: 0,
      });
    }

    // Update expired requests to EXPIRED status
    const updateResult = await db.memberItemRequest.updateMany({
      where: {
        id: {
          in: expiredRequests.map((req) => req.id),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // Log the expired requests for monitoring
    console.log(`Expired ${updateResult.count} member item requests:`, {
      requests: expiredRequests.map((req) => ({
        id: req.id,
        item: req.item.title,
        user: `${req.user.firstName} ${req.user.lastName}`,
        requestedAt: req.requestedAt,
        expiresAt: req.expiresAt,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully expired ${updateResult.count} requests`,
      expiredCount: updateResult.count,
      expiredRequests: expiredRequests.map((req) => ({
        id: req.id,
        itemTitle: req.item.title,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        requestedAt: req.requestedAt,
        expiresAt: req.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Error expiring member requests:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
