import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Apply auth middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const userId = req.user.userId;
    const { status, startDate, endDate } = req.nextUrl.searchParams;

    // Build query
    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apply auth middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const userId = req.user.userId;
    const { therapistId, startTime, endTime, type, notes } = await req.json();

    // Validate input
    if (!therapistId || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check therapist availability
    const existingBooking = await prisma.booking.findFirst({
      where: {
        therapistId,
        startTime: {
          lte: new Date(endTime),
        },
        endTime: {
          gte: new Date(startTime),
        },
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Therapist is not available at this time' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        therapistId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        notes,
      },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Apply auth middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const userId = req.user.userId;
    const { id, status, notes } = await req.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        notes,
      },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Apply auth middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const userId = req.user.userId;
    const { id } = await req.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 