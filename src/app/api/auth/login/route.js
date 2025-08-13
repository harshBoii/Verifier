import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Find the user and include their roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: { // Include the roles from the join table
          include: {
            role: true, // Include the actual Role model with its name
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid password.' }, { status: 401 });
    }

    // 2. Extract the primary role name for the JWT
    // This assumes a user has at least one role. Add error handling if needed.
    const primaryRole = user.roles[0]?.role.name;
    if (!primaryRole) {
        return NextResponse.json({ message: 'User has no assigned role.' }, { status: 403 });
    }

    // 3. Create the JWT with the correct role
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: primaryRole, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Set the cookie and send the response
    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        role: primaryRole,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}