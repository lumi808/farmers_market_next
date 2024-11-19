import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            farmName: true,
            farmAddress: true,
            phoneNumber: true,
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
