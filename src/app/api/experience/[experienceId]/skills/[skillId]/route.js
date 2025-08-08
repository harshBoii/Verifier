import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles PUT requests to update a skill's verification status for a work experience.
 * Expects a body with { "verificationStatus": "VERIFIED" | "UNVERIFIED" }
 */
export async function PUT(request, { params }) {
  try {
    const { experienceId, skillId } = params;
    const { verificationStatus } = await request.json();

    if (!verificationStatus) {
      return NextResponse.json({ error: 'Verification status is required.' }, { status: 400 });
    }

    const updatedWorkSkill = await prisma.workExperienceSkill.update({
      where: {
        workExperienceId_skillId: {
          workExperienceId: parseInt(experienceId, 10),
          skillId: parseInt(skillId, 10),
        },
      },
      data: {
        verificationStatus: verificationStatus,
      },
    });

    return NextResponse.json(updatedWorkSkill, { status: 200 });

  } catch (error) {
    console.error("API Update Work Skill Error:", error);
    return NextResponse.json({ error: 'Failed to update work skill.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a skill from a work experience.
 */
export async function DELETE(request, { params }) {
  try {
    const { experienceId, skillId } = params;

    await prisma.workExperienceSkill.delete({
      where: {
        workExperienceId_skillId: {
          workExperienceId: parseInt(experienceId, 10),
          skillId: parseInt(skillId, 10),
        },
      },
    });

    return NextResponse.json({ message: 'Skill removed from experience successfully.' }, { status: 200 });

  } catch (error) {
    console.error("API Delete Work Skill Error:", error);
    return NextResponse.json({ error: 'Failed to remove skill from experience.' }, { status: 500 });
  }
}
