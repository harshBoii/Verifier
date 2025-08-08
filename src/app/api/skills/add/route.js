import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function POST(request) {
  try {
    // 1. Authenticate the user from their session
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    // 2. Get the form data from the request body
    const body = await request.json();
    const {
      name,
      category,
      skillType,
      workExperienceId, // This will be a number or null
    } = body;

    // 3. Basic validation
    if (!name || !category || !skillType) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
    }
    if (skillType === 'ROLE' && !workExperienceId) {
      return NextResponse.json({ error: 'A work experience must be selected for Role Based skills.' }, { status: 400 });
    }

    // 4. Use Prisma to create the new skill
    const newSkill = await prisma.skill.create({
      data: {
        name,
        category,
        skillType,
        // We are not creating the link here directly anymore.
        // It will be created in the next step if needed.
      },
    });

    // 5. If it's a Role Based skill, create the link in the join table
    if (skillType === 'ROLE') {
      await prisma.workExperienceSkill.create({
        data: {
          skillId: newSkill.id,
          workExperienceId: parseInt(workExperienceId, 10),
        },
      });
    }

    return NextResponse.json(newSkill, { status: 201 });

  } catch (error) {
    // Handle unique constraint violation (e.g., skill name already exists)
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A skill with this name already exists.' }, { status: 409 });
    }
    console.error("API Add Skill Error:", error);
    return NextResponse.json({ error: 'Failed to add skill.' }, { status: 500 });
  }
}
