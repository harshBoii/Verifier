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
      role,
      companyName,
      employeeId,
      workType,
      location,
      startDate,
      endDate,
      currentlyWorking,
      description,
    } = body;

    // 3. Basic validation
    if (!role || !companyName || !workType || !location || !startDate) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
    }

    // 4. Use Prisma to create the new work experience record
    const newExperience = await prisma.workExperience.create({
      data: {
        userId: userId, // Link to the logged-in user
        role,
        companyName,
        employeeId,
        workType,
        location,
        startDate: new Date(startDate),
        // Only include endDate if it's provided and user is not currently working
        endDate: !currentlyWorking && endDate ? new Date(endDate) : null,
        currentlyWorking,
        description,
      },
    });

    return NextResponse.json(newExperience, { status: 201 });

  } catch (error) {
    console.error("API Add Experience Error:", error);
    return NextResponse.json({ error: 'Failed to add work experience.' }, { status: 500 });
  }
}
