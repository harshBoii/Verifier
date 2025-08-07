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
      degree,
      institution,
      branch,
      rollNumber,
      startDate,
      endDate,
      gradeInCgpa,
      description,
    } = body;

    // 3. Basic validation
    if (!degree || !institution || !startDate) {
      return NextResponse.json({ error: 'Degree, Institution, and Start Date are required.' }, { status: 400 });
    }

    // 4. Use Prisma to create the new education record
    const newEducation = await prisma.education.create({
      data: {
        userId: userId, // Link to the logged-in user
        degree,
        institution,
        branch,
        rollNumber,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        gradeInCgpa: gradeInCgpa ? parseFloat(gradeInCgpa) : null,
        description,
      },
    });

    return NextResponse.json(newEducation, { status: 201 });

  } catch (error) {
    console.error("API Add Education Error:", error);
    return NextResponse.json({ error: 'Failed to add education.' }, { status: 500 });
  }
}
