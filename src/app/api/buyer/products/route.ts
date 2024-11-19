import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

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
        farmer: { select: { farmAddress: true } },
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

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
