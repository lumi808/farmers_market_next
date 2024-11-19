import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PUT(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
    // Get userId from params
    const userId = await context.params.userId

    // Get rejection reason from request body
    const { reason } = await request.json()

    // Validate rejection reason
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Check if user exists as a buyer
    const buyer = await prisma.buyer.findUnique({
      where: { id: userId }
    })

    if (buyer) {
      // Update buyer status to DISABLED
      const updatedBuyer = await prisma.buyer.update({
        where: { id: userId },
        data: { 
          status: 'DISABLED',
          rejectionReason: reason,
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
          rejectionReason: updatedBuyer.rejectionReason,
          role: 'BUYER' as const,
          paymentMethod: updatedBuyer.paymentMethod,
          address: updatedBuyer.address,
        }
      })
    }

    // Check if user exists as a farmer
    const farmer = await prisma.farmer.findUnique({
      where: { id: userId }
    })

    if (farmer) {
      // Update farmer status to DISABLED
      const updatedFarmer = await prisma.farmer.update({
        where: { id: userId },
        data: { 
          status: 'DISABLED',
          rejectionReason: reason,
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
          rejectionReason: updatedFarmer.rejectionReason,
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
    console.error('Error rejecting user:', error)
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    )
  }
}
