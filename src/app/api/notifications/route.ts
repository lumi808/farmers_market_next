import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const farmerId = searchParams.get('farmerId');
  
      if (!farmerId) {
        return NextResponse.json(
          { error: 'Farmer ID is required' },
          { status: 400 }
        );
      }
  
      // Retrieve notifications for the given farmer
      const notifications = await prisma.notification.findMany({
        where: { farmerId },
        orderBy: { createdAt: 'desc' },
      });
  
      return NextResponse.json(
        {
          message: 'Notifications retrieved successfully',
          notifications,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve notifications' },
        { status: 500 }
      );
    }
  }
  