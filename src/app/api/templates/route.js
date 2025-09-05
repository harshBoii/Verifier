// import { NextResponse } from 'next/server';
// import prisma from '@/app/lib/prisma'; // Make sure this path points to your Prisma client instance

// /**
//  * GET -> Fetch all email templates from the database.
//  */
// export async function GET(request) {
//   try {
//     // Use Prisma's findMany to retrieve all records from the EmailTemplate table
//     const templates = await prisma.emailTemplate.findMany({
//       // Optional: order the results for consistency, e.g., by type and then by name
//       orderBy: [
//         {
//           type: 'asc',
//         },
//         {
//           name: 'asc',
//         },
//       ],
//     });

//     // Return the array of templates with a 200 OK status
//     return NextResponse.json(templates, { status: 200 });

//   } catch (error) {
//     // Log the error for debugging purposes
//     console.error("API Error: Failed to fetch email templates.", error);

//     // Return a generic error response
//     return NextResponse.json({ error: 'An error occurred while fetching email templates.' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // Adjust path to your prisma instance

/**
 * This API route fetches all email templates for a given companyId.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId query parameter is required' },
        { status: 400 }
      );
    }

    // Note: This assumes you have a model named 'EmailTemplate' in your schema
    // that is related to a 'Company'.
    const templates = await prisma.emailTemplate.findMany({
      where: {
        companyId: parseInt(companyId, 10),
      },
      orderBy: {
        name: 'asc', // Order templates alphabetically by name
      },
    });

    return NextResponse.json({ templates });

  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
