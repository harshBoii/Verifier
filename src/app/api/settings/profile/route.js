import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

/**
 * Handles GET requests to fetch the logged-in user's profile for the settings page.
 */
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Select only the fields needed for the form
      select: {
        fullName: true,
        roles: {
                select: {
                  role: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
        position: true,
        mobile: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

/**
 * Handles PUT requests to update the logged-in user's profile.
 */
export async function PUT(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    const data = await request.json();
    
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        position: data.position, // Assuming 'designation' maps to 'position'
        mobile: data.mobile,
        // Email and role are typically not editable by the user
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
