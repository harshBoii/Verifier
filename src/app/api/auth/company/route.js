// In app/api/auth/company/route.js

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { 
        company: true // Include the related company data
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    
    if (!user.company) {
        return NextResponse.json({ error: 'No company is associated with this user.' }, { status: 404 });
    }

    // --- SECURITY FIX ---
    // Explicitly remove the password from the user object before sending it.
    const { password, ...userWithoutPassword } = user;

    // Return a structured response with the user (without password) and the company
    return NextResponse.json({
      user: userWithoutPassword,
      company: user.company,
      loginTime: new Date(payload.iat * 1000), // Convert to a standard Date object
    });

  } catch (error) {
    // This catches errors from jwtVerify (e.g., expired or invalid token)
    console.error("Authentication Error:", error);
    return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
  }
}
