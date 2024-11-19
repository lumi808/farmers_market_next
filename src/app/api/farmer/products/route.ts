import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const formData = await request.formData();
  const farmerId = formData.get('farmerId')?.toString();
  const name = formData.get('name')?.toString();
  const description = formData.get('description')?.toString();
  const price = parseFloat(formData.get('price')?.toString() || '0');
  const quantity = parseInt(formData.get('quantity')?.toString() || '0', 10);
  const category = formData.get('category')?.toString();
  const image = formData.get('image') as File;

  // Validation
  if (!farmerId || !name || !description || !price || !quantity || !category || !image) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Process images
    const buffer = await sharp(await image.arrayBuffer())
      .resize(800, 800, { fit: 'inside' }) // Resize image for optimization
      .toBuffer();
    const base64 = buffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`; // Base64-encoded image


    // Save product to the database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        quantity,
        category,
        image: imageUrl,
        farmerId,
      },
    });

    return NextResponse.json({ message: 'Product added successfully', product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { id, name, description, price, quantity, category } = await request.json();

  // Validation
  if (!id || !name || !description || !price || !quantity || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, description, price, quantity, category },
    });

    return NextResponse.json({ message: 'Product updated successfully', updatedProduct }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  // Validation
  if (!id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
