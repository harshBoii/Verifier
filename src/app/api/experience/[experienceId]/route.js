import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    // Fetch the single work experience and include its related user and skills
    const experience = await prisma.workExperience.findUnique({
      where: {
        id: numericId,
      },
      include: {
        user: true, // Include the user this experience belongs to
        skills: {
          include: {
            skill: true, // Include the full skill details
          },
        },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    return NextResponse.json(experience, { status: 200 });

  } catch (error) {
    console.error("API Fetch Single Experience Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
