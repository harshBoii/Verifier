import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles GET requests to fetch the verification status of a single work experience.
 * URL: /api/experience/verify/[experienceId]
 */
export async function GET(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    const experience = await prisma.workExperience.findUnique({
      where: {
        id: numericId,
      },
      select: {
        is_verified: true, // Only select the field we need
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    return NextResponse.json({ is_verified: experience.is_verified }, { status: 200 });

  } catch (error) {
    console.error("API GET Experience Status Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to set a work experience's is_verified status to true.
 * URL: /api/experience/verify/[experienceId]
 */
export async function POST(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    const updatedExperience = await prisma.workExperience.update({
      where: {
        id: numericId,
      },
      data: {
        is_verified: true, // Set the verification status to true
      },
    });

    return NextResponse.json(updatedExperience, { status: 200 });

  } catch (error) {
    console.error("API POST Verify Experience Error:", error);
    if (error.code === 'P2025') { // Prisma's code for "Record to update not found"
        return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update work experience.' }, { status: 500 });
  }
}
