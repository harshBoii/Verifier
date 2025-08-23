import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // Adjust this import path if needed

export async function POST(request) {
  try {
    const body = await request.json();
    const { experienceId } = body;

    // 1. Validate the input
    if (!experienceId) {
      return NextResponse.json({ error: 'experienceId is required.' }, { status: 400 });
    }

    const numericId = parseInt(experienceId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid Experience ID format.' }, { status: 400 });
    }

    // 2. Update the database record
    // This assumes your Prisma model has a boolean field named `chat_started`.
    const updatedExperience = await prisma.workExperience.update({
      where: {
        id: numericId,
      },
      data: {
        chat_started: true, // Mark that the chat has been initiated
      },
    });

    // 3. Return a success response
    return NextResponse.json({
      message: 'Verification process started successfully.',
      data: updatedExperience,
    });

  } catch (error) {
    console.error("API Start Verification Error:", error);

    // Handle specific Prisma error for record not found
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Work experience record not found.' }, { status: 404 });
    }

    // Handle generic errors
    return NextResponse.json({ error: 'Failed to start verification process.' }, { status: 500 });
  }
}
