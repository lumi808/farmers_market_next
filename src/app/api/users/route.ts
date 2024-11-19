import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Fetch both buyers and farmers
    const [buyers, farmers] = await Promise.all([
      prisma.buyer.findMany({
        where: status ? { status } : undefined,
      }),
      prisma.farmer.findMany({
        where: status ? { status } : undefined,
      }),
    ])

    // Transform buyers to match the User interface
    const formattedBuyers = buyers.map(buyer => ({
      id: buyer.id,
      email: buyer.email,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      phoneNumber: buyer.phoneNumber,
      status: buyer.status as 'PENDING' | 'ACTIVE' | 'DISABLED',
      createdAt: buyer.createdAt.toISOString(),
      rejectionReason: buyer.rejectionReason,
      role: 'BUYER' as const,
      paymentMethod: buyer.paymentMethod,
      address: buyer.address,
    }))

    // Transform farmers to match the User interface
    const formattedFarmers = farmers.map(farmer => ({
      id: farmer.id,
      email: farmer.email,
      firstName: farmer.firstName,
      lastName: farmer.lastName,
      phoneNumber: farmer.phoneNumber,
      status: farmer.status as 'PENDING' | 'ACTIVE' | 'DISABLED',
      createdAt: farmer.createdAt.toISOString(),
      rejectionReason: farmer.rejectionReason,
      role: 'FARMER' as const,
      farmName: farmer.farmName,
      farmAddress: farmer.farmAddress,
      farmSize: farmer.farmSize,
    }))

    // Combine and sort by createdAt
    const users = [...formattedBuyers, ...formattedFarmers].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
