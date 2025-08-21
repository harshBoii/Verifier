import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { campaignId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Will be 'verified' or 'pending'

    if (!status || !['verified', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'A valid status (verified or pending) is required.' }, { status: 400 });
    }

    const is_verified = status === 'verified';

    const members = await prisma.user.findMany({
      where: {
        campaigns: {
          some: {
            campaignId: parseInt(campaignId, 10),
          },
        },
        is_verified: is_verified,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return NextResponse.json(members);

  } catch (error) {
    console.error("API Get Campaign Members Error:", error);
    return NextResponse.json({ error: 'Failed to fetch campaign members.' }, { status: 500 });
  }
}
