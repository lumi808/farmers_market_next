import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      farmName,
      farmAddress,
      farmSize,
      phoneNumber,
      action,
    } = body;

    // Validate action
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Validate required fields for registration
    if (action === 'register') {
      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !farmName ||
        !farmAddress ||
        farmSize === undefined || // Allow 0 as a valid size
        !phoneNumber
      ) {
        return NextResponse.json(
          { error: 'Missing required fields for registration' },
          { status: 400 }
        );
      }

      try {
        // Check if farmer already exists
        const existingFarmer = await prisma.farmer.findUnique({
          where: { email },
        });

        if (existingFarmer) {
          return NextResponse.json(
            { error: 'Farmer with this email already exists' },
            { status: 400 }
          );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new farmer
        const farmer = await prisma.farmer.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            farmName,
            farmAddress,
            farmSize,
            phoneNumber,
          },
        });

        return NextResponse.json(
          {
            message: 'Farmer registered successfully',
            farmer: { ...farmer, password: undefined },
          },
          { status: 201 }
        );
      } catch (registerError) {
        console.error('Error during registration:', registerError);
        return NextResponse.json(
          { error: 'Failed to register farmer' },
          { status: 500 }
        );
      }
    }

    // Validate required fields for login
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Missing email or password for login' },
          { status: 400 }
        );
      }

      try {
        // Find farmer
        const farmer = await prisma.farmer.findUnique({
          where: { email },
        });

        if (!farmer) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, farmer.password);

        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          {
            message: 'Login successful',
            farmer: { ...farmer, password: undefined },
          },
          { status: 200 }
        );
      } catch (loginError) {
        console.error('Error during login:', loginError);
        return NextResponse.json(
          { error: 'Failed to process login' },
          { status: 500 }
        );
      }
    }

    // Invalid action
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
