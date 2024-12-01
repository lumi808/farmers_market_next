import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
    try {
      const orderId = (await params).orderId;
  
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          products: { include: { product: true } },
          buyer: true,
        },
      });
  
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
  
      return NextResponse.json(order, { status: 200 });
    } catch (error) {
      console.error('Error fetching order details:', error);
      return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
    try {
      const orderId = (await params).orderId;
      const { status } = await request.json();
  
      const validStatuses = ['PENDING', 'DELIVERED', 'APPROVED', 'COMING'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
      }
  
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
  
      return NextResponse.json({ message: 'Order status updated successfully', order }, { status: 200 });
    } catch (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
