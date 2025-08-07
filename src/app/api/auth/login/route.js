import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // Your Prisma client
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // 2. Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password); // Assumes you have a 'password' field in your User model

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid password.' }, { status: 401 });
    }

    // 3. If credentials are valid, create a JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // 4. Set the token in a secure, httpOnly cookie
    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour in seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}