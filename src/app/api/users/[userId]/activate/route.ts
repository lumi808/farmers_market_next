import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user exists as a buyer
    const buyer = await prisma.buyer.findUnique({
      where: { id: params.userId }
    })

    if (buyer) {
      // Update buyer status to ACTIVE
      const updatedBuyer = await prisma.buyer.update({
        where: { id: params.userId },
        data: { 
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      })

      // Format response to match User interface
      return NextResponse.json({
        user: {
          id: updatedBuyer.id,
          email: updatedBuyer.email,
          firstName: updatedBuyer.firstName,
          lastName: updatedBuyer.lastName,
          phoneNumber: updatedBuyer.phoneNumber,
          status: updatedBuyer.status as 'PENDING' | 'ACTIVE' | 'DISABLED',
          createdAt: updatedBuyer.createdAt.toISOString(),
          role: 'BUYER' as const,
          paymentMethod: updatedBuyer.paymentMethod,
          address: updatedBuyer.address,
        }
      })
    }

    // Check if user exists as a farmer
    const farmer = await prisma.farmer.findUnique({
      where: { id: params.userId }
    })

    if (farmer) {
      // Update farmer status to ACTIVE
      const updatedFarmer = await prisma.farmer.update({
        where: { id: params.userId },
        data: { 
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      })

      // Format response to match User interface
      return NextResponse.json({
        user: {
          id: updatedFarmer.id,
          email: updatedFarmer.email,
          firstName: updatedFarmer.firstName,
          lastName: updatedFarmer.lastName,
          phoneNumber: updatedFarmer.phoneNumber,
          status: updatedFarmer.status as 'PENDING' | 'ACTIVE' | 'DISABLED',
          createdAt: updatedFarmer.createdAt.toISOString(),
          role: 'FARMER' as const,
          farmName: updatedFarmer.farmName,
          farmAddress: updatedFarmer.farmAddress,
          farmSize: updatedFarmer.farmSize,
        }
      })
    }

    // If no user found with the given ID
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error activating user:', error)
    return NextResponse.json(
      { error: 'Failed to activate user' },
      { status: 500 }
    )
  }
}