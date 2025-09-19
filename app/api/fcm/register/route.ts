import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { PrismaClient } from '@prisma/client';

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

    const { token, device } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    // Check if token already exists for this user
    const existingToken = await prisma.fCMToken.findFirst({
      where: {
        userId: session.user.id,
        token,
      },
    });

    if (existingToken) {
      // Update lastUsed timestamp
      await prisma.fCMToken.update({
        where: {
          id: existingToken.id,
        },
        data: {
          lastUsed: new Date(),
          isActive: true,
        },
      });
    } else {
      // Deactivate old tokens for this user/device combination
      await prisma.fCMToken.updateMany({
        where: {
          userId: session.user.id,
          device: device || 'web',
        },
        data: {
          isActive: false,
        },
      });

      // Create new token record
      await prisma.fCMToken.create({
        data: {
          userId: session.user.id,
          token,
          device: device || 'web',
          isActive: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}