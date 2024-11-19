import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      paymentMethod,
      address,
      phoneNumber,
      action,
    } = await request.json();

    if (action === 'register') {
      if (!email || !password || !firstName || !lastName || !paymentMethod || !address || !phoneNumber) {
        return NextResponse.json(
          { error: 'Missing required fields for registration' },
          { status: 400 }
        );
      }
      
      try {
        // Check if buyer already exists
        const existingBuyer = await prisma.buyer.findUnique({
          where: { email },
        });

        if (existingBuyer) {
          return NextResponse.json(
            { error: 'Buyer with this email already exists' },
            { status: 400 }
          );
        }

        // Hash password
        let hashedPassword;
        try {
          hashedPassword = await bcrypt.hash(password, 10);
        } catch (hashError) {
          console.error('Error hashing password:', hashError);
          return NextResponse.json(
            { error: 'Failed to hash password' },
            { status: 500 }
          );
        }

        // Create new buyer
        const buyer = await prisma.buyer.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            paymentMethod,
            address,
            phoneNumber,
          },
        });

        return NextResponse.json(
          {
            message: 'Buyer registered successfully',
            buyer: { ...buyer, password: undefined },
          },
          { status: 201 }
        );
      } catch (registerError) {
        console.error('Error during registration:', registerError);
        return NextResponse.json(
          { error: 'Failed to register buyer' },
          { status: 500 }
        );
      }
    }

    if (action === 'login') {
      try {
        // Find buyer
        const buyer = await prisma.buyer.findUnique({
          where: { email },
        });

        if (!buyer) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

        // Validate password
        let isPasswordValid;
        try {
          isPasswordValid = await bcrypt.compare(password, buyer.password);
        } catch (compareError) {
          console.error('Error comparing password:', compareError);
          return NextResponse.json(
            { error: 'Failed to validate credentials' },
            { status: 500 }
          );
        }

        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          {
            message: 'Login successful',
            buyer: { ...buyer, password: undefined },
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