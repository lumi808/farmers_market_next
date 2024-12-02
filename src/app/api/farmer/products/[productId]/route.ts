import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const productId = (await params).productId

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    // Validate updates
    const allowedFields = ['name', 'description', 'price', 'quantity', 'category', 'image'];
    const updateData = Object.keys(updates).reduce((acc, key) => {
      if (allowedFields.includes(key)) acc[key] = updates[key];
      return acc;
    }, {} as Record<string, unknown>);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Product updated successfully', updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
