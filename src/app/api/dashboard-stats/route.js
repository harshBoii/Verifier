import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose'; // Import the jose library for JWT verification

export async function GET(request) {
  try {
    // --- 1. Get the Admin's Company ID from their session ---
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // The payload contains the user's details we stored during login
    const adminId = payload.userId;

    // Find the admin to get their companyId
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.companyId) {
      return NextResponse.json({ error: 'Admin or company not found.' }, { status: 404 });
    }

    const adminCompanyId = admin.companyId;

    // --- 2. Fetch Stats Scoped to the Admin's Company ---

    // Get the total count of all employees in that company
    const totalEmployees = await prisma.user.count({
      where: {
        companyId: adminCompanyId,
        role: 'EMPLOYEE',
      },
    });

    // Get the count of verified employees in that company using the new 'is_verified' field
    const verifiedEmployees = await prisma.user.count({
      where: {
        companyId: adminCompanyId,
        role: 'EMPLOYEE',
        is_verified: true, // Use the new boolean field
      },
    });

    // Calculate pending employees directly
    const pendingEmployees = totalEmployees - verifiedEmployees;

    // --- 3. Return the Scoped Data ---
    return NextResponse.json({
      totalEmployees,
      verifiedEmployees,
      pendingEmployees,
    });

  } catch (error) {
    // Handle potential JWT errors (e.g., expired token)
    if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }
    console.error("API Dashboard Stats Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics.' }, { status: 500 });
  }
}