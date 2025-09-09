import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  // We'll get the companyId from the URL's query string
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
  }

  try {
    const numericCompanyId = parseInt(companyId, 10);
    if (isNaN(numericCompanyId)) {
      return NextResponse.json({ error: 'Invalid Company ID format' }, { status: 400 });
    }

    // Find all users that belong to the given company
    const usersInCompany = await prisma.user.findMany({
      where: {
        companyId: numericCompanyId,
      },
      select: {
        id: true, // Select user IDs to find their experiences
      },
    });

    if (usersInCompany.length === 0) {
      // If no users, there can be no work experiences
      return NextResponse.json([]);
    }

    // Extract the list of user IDs
    const userIds = usersInCompany.map(user => user.id);

    // Fetch all work experiences for those users
    const workExperiences = await prisma.workExperience.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      include: {
        // Include the user's details, specifically their full name for the UI
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc', // Show the most recent experiences first
      },
    });

    return NextResponse.json(workExperiences);

  } catch (error) {
    console.error("Failed to fetch work experiences by company:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
