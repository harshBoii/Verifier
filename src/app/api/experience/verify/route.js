import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
  try {
    const { experienceId, isVerified } = await request.json();

    if (experienceId === undefined || isVerified === undefined) {
      return NextResponse.json({ error: 'Missing experienceId or verification status.' }, { status: 400 });
    }

    // Find the work experience and update its verification status
    const updatedExperience = await prisma.workExperience.update({
      where: {
        id: parseInt(experienceId, 10),
      },
      data: {
        is_verified: isVerified,
      },
    });

    return NextResponse.json(updatedExperience, { status: 200 });

  } catch (error) {
    console.error("API Verify Experience Error:", error);
    // Handle cases where the record to update is not found
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update work experience.' }, { status: 500 });
  }
}
