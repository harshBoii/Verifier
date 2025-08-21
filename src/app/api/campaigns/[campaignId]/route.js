import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * --- NEW ---
 * Handles GET requests to fetch details for a single campaign.
 */
export async function GET(request, { params }) {
  try {
    const { campaignId } = params;

    // Fetch the specific campaign by its ID
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: parseInt(campaignId, 10),
      },
      include: {
        // Use _count to get the total number of members in the campaign
        _count: {
          select: { members: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    // Now, calculate the number of verified members within that campaign
    const verifiedCount = await prisma.user.count({
      where: {
        is_verified: true,
        campaigns: {
          some: {
            campaignId: parseInt(campaignId, 10),
          },
        },
      },
    });
    
    const totalMembers = campaign._count.members;
    const notVerifiedCount = totalMembers - verifiedCount;

    // Construct the detailed response object
    const campaignDetails = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      totalMembers: totalMembers,
      totalVerified: verifiedCount,
      notVerified: notVerifiedCount,
    };

    return NextResponse.json(campaignDetails);

  } catch (error) {
    console.error("API Get Campaign Details Error:", error);
    return NextResponse.json({ error: 'Failed to fetch campaign details.' }, { status: 500 });
  }
}

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

        // Use 204 No Content for successful deletions as a best practice
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("API Delete Campaign Error:", error);
        return NextResponse.json({ error: 'Failed to delete campaign.' }, { status: 500 });
    }
}
