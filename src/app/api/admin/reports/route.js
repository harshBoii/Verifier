import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    // Create a dynamic where clause for filtering by company
    const whereClause = companyId ? { companyId: parseInt(companyId, 10) } : {};
    const userWhereClause = companyId ? { user: { companyId: parseInt(companyId, 10) } } : {};


    const now = new Date();

    // Run all database queries concurrently
    const [
      byRole,
      mix,
      topSkills,
      skillVerif,
      campaigns,
      campaignLifecycleCounts,
      perms
    ] = await prisma.$transaction([
      // Query #1: Org Role Pyramid
      prisma.role.findMany({
        where: {
            users: { some: whereClause.companyId ? { user: { companyId: whereClause.companyId } } : {} }
        },
        include: { _count: { select: { users: true } } },
      }),

      // Query #2: Staff by Work Type
      prisma.workExperience.groupBy({
        by: ['workType'],
        where: userWhereClause,
        _count: { _all: true },
      }),
      
      // Query #3: Top 5 Skills Footprint
      prisma.skill.findMany({
        where: {
            workExperiences: { some: userWhereClause.user ? { workExperience: { user: { companyId: userWhereClause.user.companyId } } } : {} }
        },
        orderBy: { endorsements: 'desc' },
        take: 5,
        select: { name: true, endorsements: true },
      }),

      // Query #4: Verification Health
      prisma.workExperienceSkill.groupBy({
        by: ['verificationStatus'],
        where: userWhereClause.user ? { workExperience: { user: { companyId: userWhereClause.user.companyId } } } : {},
        _count: { _all: true },
      }),

      // Query #5: Top 5 Campaign Funnel
      prisma.campaign.findMany({
        where: whereClause,
        include: { _count: { select: { members: true } } },
        orderBy: { members: { _count: 'desc' } },
        take: 5,
      }),

      // Query #6: Campaign Lifecycle
      prisma.campaign.groupBy({
        by: ['companyId'],
        where: {
            ...whereClause,
            OR: [
                { startDate: { gt: now } },
                { startDate: { lte: now }, endDate: { gte: now } },
                { endDate: { lt: now } },
            ],
        },
        _count: { _all: true },
      }),
      
      // Query #7: Permission Audit (Global)
      prisma.rolePermission.findMany(),
    ]);

    // --- Process Data for Frontend ---
    const upcoming = await prisma.campaign.count({ where: { ...whereClause, startDate: { gt: now } } });
    const active = await prisma.campaign.count({ where: { ...whereClause, startDate: { lte: now }, endDate: { gte: now } } });
    const completed = await prisma.campaign.count({ where: { ...whereClause, endDate: { lt: now } } });

    // Mocked Data
    const hires = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [12, 19, 3, 5, 2, 3] };
    const current = { '0-1 years': 15, '1-2 years': 8, '3-5 years': 5, '5+ years': 2 };
    const subscriptionUtilization = { usedThisCycle: 120, limit: 500 };

    const datasets = {
      orgRolePyramid: byRole.map(r => ({ role: r.name, count: r._count.users })),
      workforceGrowth: hires,
      staffByWorkType: mix.map(m => ({ type: m.workType, count: m._count._all })),
      tenureDistribution: current,
      skillsFootprint: topSkills,
      verificationHealth: {
        verified: skillVerif.find(s => s.verificationStatus === 'VERIFIED')?._count._all || 0,
        unverified: skillVerif.find(s => s.verificationStatus === 'UNVERIFIED')?._count._all || 0,
      },
      campaignFunnel: campaigns.map(c => ({ name: c.name, members: c._count.members })),
      campaignLifecycle: { upcoming, active, completed },
      subscriptionUtilization: subscriptionUtilization,
      permissionAudit: perms
    };

    return NextResponse.json(datasets);

  } catch (error) {
    console.error("API Comprehensive Stats Error:", error);
    return NextResponse.json({ error: 'Failed to fetch comprehensive dashboard data.' }, { status: 500 });
  }
}
