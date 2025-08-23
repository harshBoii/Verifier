import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose'; // Make sure 'jose' is installed for JWT handling

export async function GET(request) {
  try {
    // --- Step 1: Authenticate the Admin and Get Their Company ID ---
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const adminId = payload.userId;

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { companyId: true },
    });

    if (!admin || !admin.companyId) {
      return NextResponse.json({ error: 'Access denied or admin is not associated with a company.' }, { status: 403 });
    }

    const companyId = admin.companyId;

    // --- Step 2: Rewrite All Queries to Filter by companyId ---

    // Query 1: Overall Verification Stats for THIS company
    const verifiedCount = await prisma.user.count({
      where: { 
        companyId: companyId, // <-- Filter added
        is_verified: true,
        roles: { some: { role: { name: 'EMPLOYEE' } } }
      },
    });
    const unverifiedCount = await prisma.user.count({
      where: { 
        companyId: companyId, // <-- Filter added
        is_verified: false,
        roles: { some: { role: { name: 'EMPLOYEE' } } }
      },
    });

    // Query 2: Top 5 Campaigns by Member Count for THIS company
    const campaigns = await prisma.campaign.findMany({
      where: { companyId: companyId }, // <-- Filter added
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

    // Query 3: Top Employees by Skill Count for THIS company
    const usersWithSkillCounts = await prisma.user.findMany({
        where: {         
          companyId: companyId, // <-- Filter added
          roles: { some: { role: { name: 'EMPLOYEE' } } }
        },
        include: {
            workExperiences: {
                include: {
                    _count: {
                        select: { skills: true }
                    }
                }
            }
        }
    });

    const topEmployeesBySkills = usersWithSkillCounts
      .map(user => {
        const totalSkills = user.workExperiences.reduce((acc, exp) => acc + exp._count.skills, 0);
        return {
            name: user.fullName,
            skillCount: totalSkills,
            id: user.id
        }
      })
      .sort((a, b) => b.skillCount - a.skillCount) // Sort by skill count descending
      .slice(0, 5); // Take the top 5

    // --- Step 3: Assemble the Final Data Object (without Top Companies) ---
    const chartData = {
      verificationStats: {
        verified: verifiedCount,
        unverified: unverifiedCount,
      },
      campaignMembers: campaigns.map(c => ({
        name: c.name,
        members: c._count.members,
        id: c.id
      })),
      topEmployeesBySkills: topEmployeesBySkills
    };

    return NextResponse.json(chartData);

  } catch (error) {
    console.error("API Company Dashboard Charts Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard chart data.' }, { status: 500 });
  }
}
