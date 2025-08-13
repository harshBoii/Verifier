// In app/api/auth/me/route.js

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        roles: {
                select: {
                  role: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
        companyId: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add the login time to the response
    // The 'iat' (issued at) claim from the JWT is a Unix timestamp in seconds.
    // We multiply by 1000 to convert it to milliseconds for JavaScript.
    return NextResponse.json({
      ...user,
      loginTime: payload.iat * 1000,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}