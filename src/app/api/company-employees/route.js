import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import { cookies } from 'next/headers';

// This function derives a user-friendly status from the database boolean
const getStatus = (isVerified) => {
    return isVerified ? 'verified' : 'pending';
};

export async function GET(request) {
  try {
    // 1. Authenticate the admin from their session cookie
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const adminId = payload.userId;

    // 2. Find the admin's company
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { companyId: true }
    });

    if (!admin || !admin.companyId) {
      return NextResponse.json({ error: 'Admin or company not found.' }, { status: 404 });
    }

    // 3. Fetch all users who are 'EMPLOYEE's of that company using the new schema
    const employees = await prisma.user.findMany({
      where: {
        companyId: admin.companyId,
        // This is the correct logic for your new schema
        roles: {
          some: {
            role: {
              name: 'EMPLOYEE',
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        position: true,
        verifier_email: true,
        is_verified: true,
        profilePicture: true,

        // Verification details
        isAddressVerified: true,
        verifiedAddress: true,
        isBankVerified: true,
        verifiedAccountName: true,
        isPfVerified: true,
        uan: true,

        company: {
          select: {
            name: true,
          },
        },
      },
    });

    // 4. Process the data to match what the frontend expects
    const processedEmployees = employees.map(emp => ({
        id: emp.id,
        name: emp.fullName,
        email: emp.email,
        role: emp.position, // Use 'position' for the role column as it's more specific
        hrEmail: emp.verifier_email,
        status: getStatus(emp.is_verified),
        companyName: emp.company.name,
        position: emp.position,
        profilePicture: emp.profilePicture,

        addressVerification: {
          isVerified: emp.isAddressVerified,
          details: emp.verifiedAddress,
        },
        bankVerification: {
          isVerified: emp.isBankVerified,
          accountName: emp.verifiedAccountName,
        },
        pfVerification: {
          isVerified: emp.isPfVerified,
          uan: emp.uan,
        },

    }));

    return NextResponse.json(processedEmployees);

  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }
    console.error("API Company Employees Error:", error);
    return NextResponse.json({ error: 'Failed to fetch employee data.' }, { status: 500 });
  }
}
