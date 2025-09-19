import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaClient } from '@prisma/client';
import { sendNotificationToUser } from '@/lib/firebase-admin';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, message } = await request.json();

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-ping
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot ping yourself' },
        { status: 400 }
      );
    }

    // Check if both users are verified members of the same church
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          churchId: true, 
          verifiedAt: true 
        },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: { 
          id: true, 
          churchId: true, 
          verifiedAt: true 
        },
      }),
    ]);

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify both users are verified church members of the same church
    if (!sender.verifiedAt || !receiver.verifiedAt || sender.churchId !== receiver.churchId || !sender.churchId) {
      return NextResponse.json(
        { error: 'Both users must be verified members of the same church' },
        { status: 403 }
      );
    }

    // Check if ping already exists
    const existingPing = await prisma.ping.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId,
        },
      },
    });

    if (existingPing) {
      return NextResponse.json(
        { error: 'Ping already sent to this user' },
        { status: 400 }
      );
    }

    // Check daily ping limit for sender
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysPings = await prisma.ping.count({
      where: {
        senderId: session.user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get sender's ping preferences (default limit is 10)
    const senderPreferences = await prisma.pingPreferences.findUnique({
      where: { userId: session.user.id },
    });
    const dailyLimit = senderPreferences?.dailyPingLimit || 10;

    if (todaysPings >= dailyLimit) {
      return NextResponse.json(
        { error: `Daily ping limit of ${dailyLimit} reached` },
        { status: 429 }
      );
    }

    // Check receiver's ping preferences
    const receiverPreferences = await prisma.pingPreferences.findUnique({
      where: { userId: receiverId },
    });

    if (receiverPreferences && !receiverPreferences.allowPingsFromAnyone) {
      return NextResponse.json(
        { error: 'User has disabled pings' },
        { status: 403 }
      );
    }

    // Create ping with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const ping = await prisma.ping.create({
      data: {
        senderId: session.user.id,
        receiverId,
        message: message || null,
        expiresAt,
      },
    });

    // Send FCM notification to receiver
    const receiverTokens = await prisma.fCMToken.findMany({
      where: {
        userId: receiverId,
        isActive: true,
      },
    });

    const senderName = sender.firstName && sender.lastName 
      ? `${sender.firstName} ${sender.lastName}`
      : 'Someone';

    // Send notifications to all active tokens
    const notificationPromises = receiverTokens.map(({ token }) =>
      sendNotificationToUser(
        token,
        {
          title: 'New Ping Request!',
          body: `${senderName} wants to connect with you`,
        },
        {
          type: 'PING_REQUEST',
          senderId: session.user.id,
          pingId: ping.id,
        }
      )
    );

    await Promise.allSettled(notificationPromises);

    // Check for auto-accept
    if (receiverPreferences?.autoAccept) {
      await prisma.ping.update({
        where: { id: ping.id },
        data: { status: 'ACCEPTED' },
      });

      return NextResponse.json({
        success: true,
        pingId: ping.id,
        status: 'ACCEPTED',
        autoAccepted: true,
      });
    }

    return NextResponse.json({
      success: true,
      pingId: ping.id,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error sending ping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}