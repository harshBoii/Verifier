import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // 1. Import your Prisma client

export async function POST(request) {
  try {
    const { userId, hrEmail } = await request.json();

    // Validate incoming data
    if (!userId || !hrEmail) {
      return NextResponse.json({ error: 'User ID and HR Email are required.' }, { status: 400 });
    }

    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return NextResponse.json({ error: 'Invalid User ID format.' }, { status: 400 });
    }

    // 2. Use Prisma to find and update the user in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: numericUserId,
      },
      data: {
        // Update the 'verifier_email' field with the new value
        verifier_email: hrEmail,
      },
    });

    console.log(`Updated user ${updatedUser.id} with Verifier Email: ${updatedUser.verifier_email}`);
    return NextResponse.json({ message: 'Verifier Email updated successfully!' });

  } catch (error) {
    // This will catch errors, including if the user was not found
    console.error("Failed to update verifier email. Error:", error);
    if (error.code === 'P2025') { // Prisma's code for "Record to update not found"
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update.' }, { status: 500 });
  }
}