import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    // In a real app, you might scope these queries by a companyId from a user session.
    // For a super admin view, fetching all data is appropriate.

    const now = new Date();

    // Run all database queries concurrently for maximum performance
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
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),

      // Query #2: Staff by Work Type
      prisma.workExperience.groupBy({
        by: ['workType'],
        _count: { _all: true },
      }),
      
      // Query #3: Top 5 Skills Footprint by endorsements
      prisma.skill.findMany({
        orderBy: { endorsements: 'desc' },
        take: 5,
        select: { name: true, endorsements: true },
      }),

      // Query #4: Verification Health
      prisma.workExperienceSkill.groupBy({
        by: ['verificationStatus'],
        _count: { _all: true },
      }),

      // Query #5: Top 5 Campaign Funnel by member count
      prisma.campaign.findMany({
        include: { _count: { select: { members: true } } },
        orderBy: { members: { _count: 'desc' } },
        take: 5,
      }),

      // Query #6: Campaign Lifecycle
      prisma.campaign.groupBy({
        by: ['companyId'], // This is just to satisfy groupBy, we care about the counts
        _count: {
          _all: true,
        },
        where: {
          OR: [
            { startDate: { gt: now } }, // Upcoming
            { startDate: { lte: now }, endDate: { gte: now } }, // Active
            { endDate: { lt: now } }, // Completed
          ],
        },
      }),
      
      // Query #7: Permission Audit (fetches all permissions)
      prisma.rolePermission.findMany(),
    ]);

    // --- Process Data for Frontend ---

    // Process Campaign Lifecycle
    const upcoming = await prisma.campaign.count({ where: { startDate: { gt: now } } });
    const active = await prisma.campaign.count({ where: { startDate: { lte: now }, endDate: { gte: now } } });
    const completed = await prisma.campaign.count({ where: { endDate: { lt: now } } });


    // Mocked Data (as in the original request)
    const hires = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [12, 19, 3, 5, 2, 3],
    };
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
