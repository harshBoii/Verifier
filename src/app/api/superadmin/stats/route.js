import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    // Fetch total companies and total employees concurrently
    const [totalCompanies, totalEmployees] = await prisma.$transaction([
      prisma.company.count(),

      prisma.user.count({ 
        where: { 
          roles: {
            some: {
              role: {
                name: 'EMPLOYEE'
              }
            }
          }
        } 
      })
    ]);

    return NextResponse.json({ totalCompanies, totalEmployees });

  } catch (error) {
    console.error("API Super Admin Stats Error:", error);
    return NextResponse.json({ error: 'Failed to fetch stats.' }, { status: 500 });
  }
}
