import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../../middleware/auth';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Apply auth middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const userId = req.user.userId;
    const { receiverId, limit = '50', before } = req.nextUrl.searchParams;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const where = {
      OR: [
        {
          senderId: userId,
          receiverId,
        },
        {
          senderId: receiverId,
          receiverId: userId,
        },
      ],
    };

    if (before) {
      where.timestamp = {
        lt: new Date(before),
      };
    }

    // Fetch messages
    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: parseInt(limit),
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 