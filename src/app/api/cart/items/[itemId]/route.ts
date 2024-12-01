import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const itemId  = (await params).itemId;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer' },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cart item updated successfully',
        cartItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const itemId = (await params).itemId;

    const deletedItem = await prisma.cartItem.delete({
      where: { id: itemId },
    });

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cart item removed successfully',
        deletedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
