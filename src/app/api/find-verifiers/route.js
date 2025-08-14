import { NextResponse } from 'next/server';

/**
 * Handles GET requests to find potential verifiers from a company website.
 * NOTE: This is a MOCKED API for demonstration purposes.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const website = searchParams.get('website');

    if (!website) {
      return NextResponse.json({ error: 'Website parameter is required.' }, { status: 400 });
    }

    // In a real application, you would use a service like Clearbit or Apollo.io
    // to find employees based on a company domain. We will return mock data here.
    console.log(`Searching for seniors at: ${website}`);
    
    const mockSeniors = [
        { id: 'sen1', name: 'John Doe', position: 'Engineering Manager', email: `john.doe@${website}` },
        { id: 'sen2', name: 'Jane Smith', position: 'Head of HR', email: `jane.smith@${website}` },
        { id: 'sen3', name: 'Peter Jones', position: 'Senior Developer', email: `peter.jones@${website}` },
    ];

    return NextResponse.json(mockSeniors);

  } catch (error) {
    console.error("API Find Verifiers Error:", error);
    return NextResponse.json({ error: 'Failed to find verifiers.' }, { status: 500 });
  }
}
