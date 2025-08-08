import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles GET requests to fetch all work experiences for a specific user.
 */
export async function GET(request, { params }) {
  try {
    const { userId } = params;
    const numericUserId = parseInt(userId, 10);

    if (isNaN(numericUserId)) {
      return NextResponse.json({ error: 'Invalid User ID.' }, { status: 400 });
    }

    const workExperiences = await prisma.workExperience.findMany({
      where: {
        userId: numericUserId,
      },
      include: {
        // Include the join table records
        skills: {
          // For each join table record, include the full skill details
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc', // Order by most recent start date
      }
    });

    if (!workExperiences) {
      return NextResponse.json([], { status: 200 }); // Return empty array if none found
    }

    return NextResponse.json(workExperiences, { status: 200 });

  } catch (error) {
    console.error("API Get User Experiences Error:", error);
    return NextResponse.json({ error: 'Failed to fetch work experiences.' }, { status: 500 });
  }
}
