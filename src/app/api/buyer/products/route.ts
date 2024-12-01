import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const name = searchParams.get('name') || undefined;
  const category = searchParams.get('category') || undefined;
  const farmLocation = searchParams.get('farmLocation') || undefined;
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam !== null ? parseFloat(maxPriceParam) : null;
  const sort = searchParams.get('sort') || 'newest';

  try {
    const products = await prisma.product.findMany({
      where: {
        AND: [
          name ? { name: { contains: name } } : {},
          category ? { category } : {},
          farmLocation ? { farmer: { farmAddress: { contains: farmLocation } } } : {},
          { price: { gte: minPrice, ...(maxPrice !== null ? { lte: maxPrice } : {}) } },
        ],
      },
      include: {
        farmer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy:
        sort === 'price_asc'
          ? { price: 'asc' }
          : sort === 'price_desc'
          ? { price: 'desc' }
          : sort === 'newest'
          ? { createdAt: 'desc' }
          : undefined,
    });

    // Customize the response to include farmer name and image
    const customizedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      image: product.image, // Include the image field
      isOutOfStock: product.isOutOfStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      farmerName: `${product.farmer.firstName} ${product.farmer.lastName}`, // Combine farmer's name
    }));

    return NextResponse.json({ products: customizedProducts }, { status: 200 });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
