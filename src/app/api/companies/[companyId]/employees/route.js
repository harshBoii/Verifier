import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { companyId } = params;
    const numericId = parseInt(companyId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid Company ID.' }, { status: 400 });
    }

    // Get the search term from the query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('name') || '';

    const employees = await prisma.user.findMany({
      where: {
        companyId: numericId,
        role: 'EMPLOYEE',
        // Add the search filter for the fullName
        fullName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        position: true,
      },
      orderBy: {
        fullName: 'asc',
      }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("API Get Company Employees Error:", error);
    return NextResponse.json({ error: 'Failed to fetch employees.' }, { status: 500 });
  }
}
