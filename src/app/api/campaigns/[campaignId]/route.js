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
// ... (your GET and DELETE methods remain the same)

export async function PUT(request, { params }) {
  try {
    const { campaignId } = params;
    const body = await request.json();
    const { name, status } = body;

    // Build the data object for the update dynamically
    const updateData = {};
    if (name) {
      updateData.name = name;
    }
    if (status) {
      // Validate that the status is one of the allowed enum values
      if (!['Active', 'Upcoming', 'Finished'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data provided for update.' }, { status: 400 });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: parseInt(campaignId, 10),
      },
      data: updateData, // Use the dynamically built object
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
