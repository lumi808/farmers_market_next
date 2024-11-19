import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmerId');

  // Validate the farmer ID
  if (!farmerId) {
    return NextResponse.json({ error: 'Farmer ID is required' }, { status: 400 });
  }

  try {
    // Fetch notifications for the farmer
    const notifications = await prisma.notification.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { farmerId } = await request.json();

  // Validate the farmer ID
  if (!farmerId) {
    return NextResponse.json({ error: 'Farmer ID is required' }, { status: 400 });
  }

  try {
    // Mark all notifications for the farmer as read
    await prisma.notification.updateMany({
      where: { farmerId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ message: 'Notifications marked as read' }, { status: 200 });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { farmerId, message } = await request.json();

  // Validate the inputs
  if (!farmerId || !message) {
    return NextResponse.json({ error: 'Farmer ID and message are required' }, { status: 400 });
  }

  try {
    // Create a new notification
    const notification = await prisma.notification.create({
      data: {
        farmerId,
        message,
        isRead: false,
      },
    });

    return NextResponse.json({ message: 'Notification created successfully', notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
