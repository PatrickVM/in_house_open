import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Count pending pings received by the current user
    const pendingPingsReceived = await prisma.ping.count({
      where: {
        receiverId: session.user.id,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
    });

    // Count recent ping responses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentResponses = await prisma.ping.count({
      where: {
        senderId: session.user.id,
        status: {
          in: ['ACCEPTED', 'REJECTED'],
        },
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get total unread notifications count
    const totalUnread = pendingPingsReceived + recentResponses;

    return NextResponse.json({
      pendingReceived: pendingPingsReceived,
      recentResponses,
      totalUnread,
      hasNotifications: totalUnread > 0,
    });
  } catch (error) {
    console.error('Error getting ping count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}