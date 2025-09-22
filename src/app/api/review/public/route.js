import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // 1. Import your Prisma client

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // 2. Convert the ID from a string to an integer for the database query
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format.' }, { status: 400 });
    }

    // 3. Use Prisma to find the user and include their related work experiences and skills
    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include:{
        workExperiences: {
          include: {
            skills: { // This is the join table
              include: {
                skill: true, // This includes the full Skill model details
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      // If Prisma doesn't find a user with that ID, return a 404 error
      return NextResponse.json({ error: 'Verification request not found.' }, { status: 404 });
    }

    // 4. If data is found, return the complete profile object from the database
    console.log(userProfile)
    return NextResponse.json(userProfile, { status: 200 });

  } catch (error) {
    console.error("API Review Fetch Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
