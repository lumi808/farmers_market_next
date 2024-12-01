import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { buyerId, farmerId } = await request.json();

    if (!buyerId || !farmerId) {
      return NextResponse.json({ error: 'Both buyerId and farmerId are required' }, { status: 400 });
    }

    // Check if a chat already exists between the buyer and farmer
    const existingChat = await prisma.chat.findFirst({
      where: { buyerId, farmerId },
    });

    if (existingChat) {
      return NextResponse.json(existingChat, { status: 200 });
    }

    // Create a new chat
    const chat = await prisma.chat.create({
      data: {
        buyerId,
        farmerId,
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const userType = url.searchParams.get('userType');

  if (!userId || !userType) {
    return NextResponse.json({ error: 'Both userId and userType are required' }, { status: 400 });
  }

  try {
    const chats = await prisma.chat.findMany({
      where: userType === 'BUYER' ? { buyerId: userId } : { farmerId: userId },
      include: {
        buyer: { select: { firstName: true, lastName: true } },
        farmer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}
