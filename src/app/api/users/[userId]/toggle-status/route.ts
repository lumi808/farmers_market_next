import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request) {
  try {
    // Extract userId from the request URL
    const url = new URL(request.url);
    const userId = url.pathname.split('/').slice(-2, -1)[0]; // Extract userId from the URL

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists as a buyer
    const buyer = await prisma.buyer.findUnique({
      where: { id: userId },
    });

    if (buyer) {
      // Toggle status between ACTIVE and DISABLED
      const newStatus = buyer.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

      const updatedBuyer = await prisma.buyer.update({
        where: { id: userId },
        data: {
          status: newStatus,
          ...(newStatus === 'ACTIVE' && { rejectionReason: null }), // Clear rejection reason if activating
          updatedAt: new Date(),
        },
      });

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
        },
      });
    }

    // Check if user exists as a farmer
    const farmer = await prisma.farmer.findUnique({
      where: { id: userId },
    });

    if (farmer) {
      // Toggle status between ACTIVE and DISABLED
      const newStatus = farmer.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

      const updatedFarmer = await prisma.farmer.update({
        where: { id: userId },
        data: {
          status: newStatus,
          ...(newStatus === 'ACTIVE' && { rejectionReason: null }), // Clear rejection reason if activating
          updatedAt: new Date(),
        },
      });

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
        },
      });
    }

    // If no user found with the given ID
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    );
  }
}
