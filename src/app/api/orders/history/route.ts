import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');

    if (!buyerId) {
      return NextResponse.json(
        { error: 'Buyer ID is required' },
        { status: 400 }
      );
    }

    // Fetch delivered orders for the specified buyer
    const deliveredOrders = await prisma.order.findMany({
      where: {
        buyerId,
        status: 'DELIVERED',
      },
      include: {
        products: { include: { product: true } }, // Include product details
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deliveredOrders, { status: 200 });
  } catch (error) {
    console.error('Error fetching delivered orders:', error);
    return NextResponse.json({ error: 'Failed to fetch delivered orders' }, { status: 500 });
  }
}
