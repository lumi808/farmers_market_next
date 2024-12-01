import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { buyerId } = await request.json();

    if (!buyerId) {
      return NextResponse.json({ error: 'Buyer ID is required' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { buyerId },
      include: { products: { include: { product: true } } },
    });

    if (!cart || cart.products.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const totalPrice = cart.products.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        buyerId,
        totalPrice,
        products: {
          create: cart.products.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({ message: 'Order created successfully', order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const buyerId = searchParams.get('buyerId');
      const farmerId = searchParams.get('farmerId');
  
      let orders;
  
      if (buyerId) {
        // Get orders for a buyer
        orders = await prisma.order.findMany({
          where: { buyerId },
          include: {
            products: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else if (farmerId) {
        // Get sales for a farmer
        orders = await prisma.order.findMany({
          where: {
            products: {
              some: { product: { farmerId } },
            },
          },
          include: {
            products: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        // Get all orders
        orders = await prisma.order.findMany({
          include: {
            products: { include: { product: true } },
            buyer: true, // Include buyer details
          },
          orderBy: { createdAt: 'desc' },
        });
      }
  
      return NextResponse.json(orders, { status: 200 });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
  }
  