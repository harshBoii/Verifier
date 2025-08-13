import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // --- 1. AUTHENTICATE THE ADMIN AND GET THEIR COMPANY ID ---
    const token = cookies().get('token')?.value;
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

    // --- 2. BUILD THE SEARCH QUERY ---
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const role = searchParams.get('role');
    const name = searchParams.get('name');

    // The base of the filter is now always scoped to the admin's company
    const whereClause = {
        companyId: adminCompanyId,
    };

    // Add additional filters if they are provided
    if (campaignId) {
      whereClause.id = parseInt(campaignId, 10);
    }
    if (role) {
      // --- THIS IS THE CORRECTED LOGIC ---
      // This now filters for campaigns that have at least one member
      // whose role name matches the filter.
      whereClause.members = {
        some: { 
          user: { 
            roles: {
              some: {
                role: {
                  name: role
                }
              }
            }
          } 
        },
      };
    }
    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    // --- 3. FETCH AND PROCESS DATA ---
    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    const campaignData = await Promise.all(
      campaigns.map(async (campaign) => {
        const verifiedCount = await prisma.user.count({
          where: {
            is_verified: true,
            companyId: adminCompanyId,
            campaigns: { some: { campaignId: campaign.id } },
          },
        });

        const totalMembers = campaign._count.members;
        const notVerifiedCount = totalMembers - verifiedCount;

        return {
          id: campaign.id,
          name: campaign.name,
          totalEmployees: totalMembers,
          totalVerified: verifiedCount,
          notVerified: notVerifiedCount,
        };
      })
    );

    return NextResponse.json(campaignData);

  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
    }
    console.error("API Search Campaigns Error:", error);
    return NextResponse.json({ error: 'Failed to search for campaigns.' }, { status: 500 });
  }
}
