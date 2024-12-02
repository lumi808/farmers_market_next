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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const farmerId = url.searchParams.get('farmerId');

    if (!farmerId) {
      return NextResponse.json(
        { error: 'Farmer ID is required' },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: 'No products found for this farmer' },
        { status: 404 }
      );
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products by farmerId:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
