import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

// This function derives a user-friendly status from the database boolean
const getStatus = (isVerified) => {
    // This is a simplified mapping. You can add more complex logic for 'rejected'.
    return isVerified ? 'verified' : 'pending';
};

export async function GET(request) {
  try {
    // 1. Authenticate the admin from their session cookie
    const token = request.cookies.get('token')?.value;
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

    // 3. Fetch all users who are 'EMPLOYEE's of that company
    const employees = await prisma.user.findMany({
      where: {
        companyId: admin.companyId,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        position: true,
        verifier_email: true,
        is_verified: true,
        company:{
          select:{
            name:true
          }
        }
      }
    });

    // 4. Process the data to match what the frontend expects
    const processedEmployees = employees.map(emp => ({
        id: emp.id,
        name: emp.fullName,
        email: emp.email,
        role: emp.position, // Use 'position' for the role column as it's more specific
        hrEmail: emp.verifier_email, // Map verifier_email to hrEmail
        status: getStatus(emp.is_verified),
        companyName:emp.company.name,
        position:emp.position
    }));

    console.log(processedEmployees)
    return NextResponse.json(processedEmployees);

  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
    }
    console.error("API Company Employees Error:", error);
    return NextResponse.json({ error: 'Failed to fetch employee data.' }, { status: 500 });
  }
}