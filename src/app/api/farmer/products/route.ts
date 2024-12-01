import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {

    const body = await request.json();

    const {
      farmerId,
      name,
      description,
      price,
      quantity,
      category,
      image,
    } = body;

    // Validation
    if (!farmerId || !name || !description || price === undefined || quantity === undefined || !category || !image) {
      console.error('Validation Failed:', { farmerId, name, description, price, quantity, category, image });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save product to the database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        quantity,
        category,
        image,
        farmerId,
        isOutOfStock: quantity === 0,
      },
    });

    return NextResponse.json({ message: 'Product added successfully', product }, { status: 201 });
  } catch (error) {
    console.error('Error while adding product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
