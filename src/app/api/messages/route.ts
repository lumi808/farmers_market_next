import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { chatId, userId, senderType, content } = await request.json();

    if (!chatId || !userId || !senderType || !content) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatId,
        userId,
        senderType,
        content,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
