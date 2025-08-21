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

export async function PUT(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    // 1. Get the updated data from the request body
    const body = await request.json();

    // 2. Basic validation to ensure required fields are present
    if (!body.role || !body.companyName || !body.location || !body.startDate) {
      return NextResponse.json({ error: 'Missing required fields: role, companyName, location, and startDate.' }, { status: 400 });
    }

    // 3. Prepare the data object for Prisma, handling data types and conditional logic
    const updateData = {
      role: body.role,
      companyName: body.companyName,
      location: body.location,
      workType: body.workType,
      employeeId: body.employeeId || null, // Set to null if empty
      description: body.description || null, // Set to null if empty
      currentlyWorking: body.currentlyWorking,
      startDate: new Date(body.startDate), // Convert date string to Date object
      // If "currently working" is checked, set endDate to null.
      // Otherwise, use the provided endDate or set it to null if it's empty.
      endDate: body.currentlyWorking ? null : (body.endDate ? new Date(body.endDate) : null),
    };

    // 4. Update the work experience in the database
    const updatedExperience = await prisma.workExperience.update({
      where: {
        id: numericId,
      },
      data: updateData,
    });

    // 5. Return the updated record with a 200 OK status
    return NextResponse.json(updatedExperience, { status: 200 });

  } catch (error) {
    console.error("API Update Experience Error:", error);

    // Provide a specific error if the record to update wasn't found
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    // Generic error for other issues
    return NextResponse.json({ error: 'An internal server error occurred while updating the experience.' }, { status: 500 });
  }
}
