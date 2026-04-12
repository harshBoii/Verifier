import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { externalId } = params;
    if (!externalId || typeof externalId !== 'string') {
      return NextResponse.json({ error: 'Invalid external ID.' }, { status: 400 });
    }

    const experience = await prisma.workExperience.findFirst({
      where: { external_id: externalId },
      include: {
        user: true,
        skills: { include: { skill: true } },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    return NextResponse.json(experience, { status: 200 });
  } catch (error) {
    console.error('API Fetch Experience by external_id Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
