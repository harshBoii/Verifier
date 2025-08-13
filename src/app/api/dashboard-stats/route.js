import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function GET(request) {
  try {
    // 1. Get the Admin's Company ID from their session
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const adminId = payload.userId;

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.companyId) {
      return NextResponse.json({ error: 'Admin or company not found.' }, { status: 404 });
    }

    const adminCompanyId = admin.companyId;

    // --- 2. Fetch Stats Scoped to the Admin's Company (with Corrected Logic) ---

    // Define the common filter for employees of the admin's company
    const employeeFilter = {
      companyId: adminCompanyId,
      // This is the updated logic to filter by role using the new relationship
      roles: {
        some: {
          role: {
            name: 'EMPLOYEE',
          },
        },
      },
    };

    // Get the total count of all employees in that company
    const totalEmployees = await prisma.user.count({
      where: employeeFilter,
    });

    // Get the count of verified employees in that company
    const verifiedEmployees = await prisma.user.count({
      where: {
        ...employeeFilter,
        is_verified: true,
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
    if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }
    console.error("API Dashboard Stats Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics.' }, { status: 500 });
  }
}
