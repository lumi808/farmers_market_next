import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phoneNumber, action } = await request.json()

    // Registration
    if (action === 'register') {
      // Check if admin already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      })

      if (existingAdmin) {
        return NextResponse.json(
          { error: 'Admin with this email already exists' },
          { status: 400 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create new admin
      const admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber
        }
      })

      return NextResponse.json({ 
        message: 'Admin registered successfully',
        admin: { ...admin, password: undefined }
      })
    }

    // Login
    if (action === 'login') {
      const admin = await prisma.admin.findUnique({
        where: { email }
      })

      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      return NextResponse.json({ 
        message: 'Login successful',
        admin: { ...admin, password: undefined }
      })
    }

  } catch (error) {
    console.error('Error occurred:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}