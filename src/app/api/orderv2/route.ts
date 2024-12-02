import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { buyerId, products } = await request.json();

    if (!buyerId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Buyer ID and a list of products with quantities are required' },
        { status: 400 }
      );
    }

    // Validate each product
    const productDetails = [];
    let totalPrice = 0;

    for (const product of products) {
      const { productId, quantity } = product;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { error: 'Each product must have a valid productId and quantity > 0' },
          { status: 400 }
        );
      }

      // Check if the product exists and has sufficient quantity
      const productData = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!productData) {
        return NextResponse.json(
          { error: `Product with ID ${productId} does not exist` },
          { status: 404 }
        );
      }

      if (productData.quantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${productData.name}` },
          { status: 400 }
        );
      }

      // Calculate price and deduct from stock
      const itemTotal = productData.price * quantity;
      totalPrice += itemTotal;

      productDetails.push({
        productId,
        quantity,
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        buyerId,
        totalPrice,
        products: {
          create: productDetails.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        products: true,
      },
    });

    // Update product quantities in the database
    for (const item of productDetails) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
