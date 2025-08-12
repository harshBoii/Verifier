import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles PUT requests to update a campaign's name.
 */
export async function PUT(request, { params }) {
  try {
    const { campaignId } = params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required.' }, { status: 400 });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: parseInt(campaignId, 10),
      },
      data: {
        name: name,
      },
    });

    return NextResponse.json(updatedCampaign);

  } catch (error) {
    console.error("API Update Campaign Error:", error);
    return NextResponse.json({ error: 'Failed to update campaign.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a campaign.
 */
export async function DELETE(request, { params }) {
    try {
        const { campaignId } = params;

        await prisma.campaign.delete({
            where: {
                id: parseInt(campaignId, 10),
            }
        });

        return NextResponse.json({ message: 'Campaign deleted successfully.' });

    } catch (error) {
        console.error("API Delete Campaign Error:", error);
        return NextResponse.json({ error: 'Failed to delete campaign.' }, { status: 500 });
    }
}
