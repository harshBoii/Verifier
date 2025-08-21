import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function PUT(request, { params }) {
  try {
    const { educationId } = params;
    const numericId = parseInt(educationId, 10);

    // 1. Authenticate the user and get their ID
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;

    // 2. Validate the education ID from the URL
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid education ID format.' }, { status: 400 });
    }

    // 3. Get the updated data from the request body
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

    // 4. Basic validation for required fields
    if (!degree || !institution || !startDate) {
      return NextResponse.json({ error: 'Degree, Institution, and Start Date are required.' }, { status: 400 });
    }

    // 5. Security Check: Verify the education record exists and belongs to the logged-in user
    const existingEducation = await prisma.education.findUnique({
      where: { id: numericId },
    });

    if (!existingEducation) {
      return NextResponse.json({ error: 'Education record not found.' }, { status: 404 });
    }

    if (existingEducation.userId !== userId) {
      // This prevents one user from updating another user's education
      return NextResponse.json({ error: 'Forbidden. You can only update your own education records.' }, { status: 403 });
    }

    // 6. Update the education record in the database
    const updatedEducation = await prisma.education.update({
      where: {
        id: numericId,
      },
      data: {
        // We don't update the userId
        degree,
        institution,
        branch,
        rollNumber,
        startDate: new Date(startDate), // Convert date string to Date object
        endDate: endDate ? new Date(endDate) : null,
        gradeInCgpa: gradeInCgpa ? parseFloat(gradeInCgpa) : null,
        description,
      },
    });

    // 7. Return the updated record with a 200 OK status
    return NextResponse.json(updatedEducation, { status: 200 });

  } catch (error) {
    console.error("API Update Education Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred while updating the education record.' }, { status: 500 });
  }
}