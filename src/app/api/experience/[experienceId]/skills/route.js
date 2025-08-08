import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles POST requests to add a skill to a work experience.
 * Expects a body with { "skillId": number }
 */
export async function POST(request, { params }) {
  try {
    const { experienceId } = params;
    const { skillId } = await request.json();

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required.' }, { status: 400 });
    }

    const numericExperienceId = parseInt(experienceId, 10);
    if (isNaN(numericExperienceId)) {
        return NextResponse.json({ error: 'Invalid Experience ID.' }, { status: 400 });
    }

    // Create the link in the join table
    const newWorkSkill = await prisma.workExperienceSkill.create({
      data: {
        workExperienceId: numericExperienceId,
        skillId: skillId,
        // verificationStatus defaults to UNVERIFIED as per your schema
      },
    });

    return NextResponse.json(newWorkSkill, { status: 201 });

  } catch (error) {
    // Handle potential errors, like adding a duplicate skill
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'This skill has already been added to this experience.' }, { status: 409 });
    }
    console.error("API Add Work Skill Error:", error);
    return NextResponse.json({ error: 'Failed to add skill to work experience.' }, { status: 500 });
  }
}
