import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import { cookies } from 'next/headers';

/**
 * Handles GET requests to fetch chart data for a specific Admin's dashboard.
 * This route is secure and scopes all data to the logged-in admin's company.
 */
export async function GET(request) {
  try {
    // --- 1. Authenticate the admin and get their user ID ---
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Ensure the user is an admin
    if (payload.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }
    const adminId = payload.userId;

    // --- 2. Fetch the admin's user record to find their companyId ---
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { companyId: true }
    });

    if (!admin || !admin.companyId) {
        return NextResponse.json({ error: 'Admin is not associated with a company.' }, { status: 404 });
    }
    const adminCompanyId = admin.companyId;

    // --- 3. Fetch data scoped to the admin's company ---

    // Query 3.1: Verification Stats for the Admin's Company
    const verifiedCount = await prisma.user.count({
      where: { companyId: adminCompanyId, role: 'EMPLOYEE', is_verified: true },
    });
    const unverifiedCount = await prisma.user.count({
      where: { companyId: adminCompanyId, role: 'EMPLOYEE', is_verified: false },
    });

    // Query 3.2: Top 5 Campaigns by Member Count for the Admin's Company
    const campaigns = await prisma.campaign.findMany({
      where: { companyId: adminCompanyId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        members: {
          _count: 'desc',
        },
      },
      take: 5,
    });
    // --- NEW: Query 3 to find employees with the most skills ---
    const usersWithSkillCounts = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        include: {
            workExperiences: {
                include: {
                    _count: {
                        select: { skills: true } // Count skills for each experience
                    }
                }
            }
        }
    });

    // Process the data in memory to get a final count
    const topEmployeesBySkills = usersWithSkillCounts.map(user => {
        const totalSkills = user.workExperiences.reduce((acc, exp) => acc + exp._count.skills, 0);
        return {
            name: user.fullName,
            skillCount: totalSkills
        }
    })
    .sort((a, b) => b.skillCount - a.skillCount) // Sort by skill count
    .slice(0, 7); // Get the top 7

    // --- Assemble the final data object ---
    const chartData = {
      verificationStats: { verified: verifiedCount, unverified: unverifiedCount },
      campaignMembers: campaigns.map(c => ({ name: c.name, members: c._count.members })),
      topEmployeesBySkills: topEmployeesBySkills, // Add the new data
    };

    return NextResponse.json(chartData);

  } catch (error) {
    console.error("API Super Admin Charts Error:", error);
    return NextResponse.json({ error: 'Failed to fetch super admin chart data.' }, { status: 500 });
  }
}
