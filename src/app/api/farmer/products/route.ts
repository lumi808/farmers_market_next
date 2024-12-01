import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const formData = await request.formData();
  const farmerId = formData.get('farmerId')?.toString();
  const name = formData.get('name')?.toString();
  const description = formData.get('description')?.toString();
  const price = parseFloat(formData.get('price')?.toString() || '0');
  const quantity = parseInt(formData.get('quantity')?.toString() || '0', 10);
  const category = formData.get('category')?.toString();
  const image = formData.get('image')?.toString(); // Expecting image as a string

  // Validation
  if (!farmerId || !name || !description || !price || !quantity || !category || !image) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Save product to the database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        quantity,
        category,
        image, // Directly use the image string
        farmerId,
      },
    });

    return NextResponse.json({ message: 'Product added successfully', product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}