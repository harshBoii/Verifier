import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles GET requests to fetch chart data for the Super Admin dashboard.
 * This route is open and does not require authentication.
 */
export async function GET() {
  try {
    // --- Query 1: Overall Verification Stats Across All Companies ---
    // This query is now corrected to check the role through the UserRole relation.
    const verifiedCount = await prisma.user.count({
      where: { 
        is_verified: true,
        roles: {
            some: {
                role: {
                    name: 'EMPLOYEE'
                }
            }
        }
      },
    });
    const unverifiedCount = await prisma.user.count({
      where: { 
        is_verified: false,
        roles: {
            some: {
                role: {
                    name: 'EMPLOYEE'
                }
            }
        }
      },
    });

    // --- Query 2: Top 5 Campaigns by Member Count Across All Companies ---
    const campaigns = await prisma.campaign.findMany({
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

    // --- Query 3: Top 7 Companies by Employee Size ---
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
       orderBy: {
        users: {
          _count: 'desc',
        },
      },
      take: 7,
    });

    const usersWithSkillCounts = await prisma.user.findMany({
        where: {         
          roles: {
            some: {
                role: {
                    name: 'EMPLOYEE'
                                }
                            }
                        }
                },
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
    const topEmployeesBySkills = usersWithSkillCounts.map(user => {
    const totalSkills = user.workExperiences.reduce((acc, exp) => acc + exp._count.skills, 0);
    return {
        name: user.fullName,
        skillCount: totalSkills,
        id:user.id
        }
    })



    // --- Assemble the final data object ---
    const chartData = {
      verificationStats: {
        verified: verifiedCount,
        unverified: unverifiedCount,
      },
      campaignMembers: campaigns.map(c => ({
        name: c.name,
        members: c._count.members,
        id:c.id
      })),
      topEmployeesBySkills: topEmployeesBySkills

    };



    return NextResponse.json(chartData);

  } catch (error) {
    console.error("API Super Admin Charts Error:", error);
    return NextResponse.json({ error: 'Failed to fetch super admin chart data.' }, { status: 500 });
  }
}
