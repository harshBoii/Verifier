import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function GET(request) {
  try {
    // 1. Authenticate the admin and get their company ID from the session cookie
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const adminId = payload.userId;

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { companyId: true }
    });

    if (!admin || !admin.companyId) {
      return NextResponse.json({ error: 'Admin or company not found.' }, { status: 404 });
    }

    const adminCompanyId = admin.companyId;

    // 2. Fetch only the campaigns that belong to the admin's company
    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: adminCompanyId, // <-- The key filtering logic
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    // 3. For each of those campaigns, calculate the verified member count
    const campaignData = await Promise.all(
      campaigns.map(async (campaign) => {
        const verifiedCount = await prisma.user.count({
          where: {
            is_verified: true,
            // Also ensure we only count users from the correct company
            companyId: adminCompanyId,
            campaigns: {
              some: {
                campaignId: campaign.id,
              },
            },
          },
        });

        const totalMembers = campaign._count.members;
        const notVerifiedCount = totalMembers - verifiedCount;

        return {
          id: campaign.id,
          name: campaign.name,
          totalMembers: totalMembers,
          totalVerified: verifiedCount,
          notVerified: notVerifiedCount,
        };
      })
    );

    // 4. Return the processed data for the specific company
    return NextResponse.json(campaignData);

  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
    }
    console.error("API Campaigns Error:", error);
    return NextResponse.json({ error: 'Failed to fetch campaign data.' }, { status: 500 });
  }
}