import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { campaignId } = params;
    const numericCampaignId = parseInt(campaignId, 10);

    if (isNaN(numericCampaignId)) {
      return NextResponse.json({ error: 'Invalid Campaign ID.' }, { status: 400 });
    }

    // Find all users who are members of the specified campaign
    const users = await prisma.user.findMany({
      where: {
        campaigns: {
          some: {
            campaignId: numericCampaignId,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        position: true,
      },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("API Get Campaign Members Error:", error);
    return NextResponse.json({ error: 'Failed to fetch campaign members.' }, { status: 500 });
  }
}
