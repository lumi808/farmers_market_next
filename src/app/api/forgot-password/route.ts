import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    console.log('Request received');
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      )
    }

    // Check if user exists as buyer or farmer
    const buyer = await prisma.buyer.findUnique({
      where: { email }
    })

    const farmer = await prisma.farmer.findUnique({
      where: { email }
    })

    if (!buyer && !farmer) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    if (buyer) {
      await prisma.buyer.update({
        where: { email },
        data: {
          password: hashedPassword,
        }
      })
    }

    if (farmer) {
      await prisma.farmer.update({
        where: { email },
        data: {
          password: hashedPassword,
        }
      })
    }

    return NextResponse.json({
      message: 'Password has been updated successfully'
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
