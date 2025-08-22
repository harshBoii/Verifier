import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles GET requests to fetch the verification status of a single work experience.
 * URL: /api/experience/verify/[experienceId]
 */
export async function GET(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    const experience = await prisma.workExperience.findUnique({
      where: {
        id: numericId,
      },
      select: {
        is_verified: true, // Only select the field we need
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    return NextResponse.json({ is_verified: experience.is_verified }, { status: 200 });

  } catch (error) {
    console.error("API GET Experience Status Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to set a work experience's is_verified status to true.
 * URL: /api/experience/verify/[experienceId]
 */

export async function POST(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark the specific work experience as verified
      const updatedExperience = await tx.workExperience.update({
        where: { id: numericId },
        data: { is_verified: true },
        select: { 
          userId: true,
          // Eagerly load the user's campaign memberships
          user: {
            select: {
              campaigns: {
                select: {
                  campaignId: true
                }
              }
            }
          }
        },
      });
      
      const { userId } = updatedExperience;

      // 2. Check and update the user's verification status
      const totalExperiences = await tx.workExperience.count({ where: { userId: userId } });
      const unverifiedExperiences = await tx.workExperience.count({ where: { userId: userId, is_verified: false } });

      let userIsNowVerified = false;
      if (totalExperiences > 0 && unverifiedExperiences === 0) {
        await tx.user.update({ where: { id: userId }, data: { is_verified: true } });
        userIsNowVerified = true;
      } else {
        await tx.user.update({ where: { id: userId }, data: { is_verified: false } });
      }

      // --- NEW CAMPAIGN LOGIC STARTS HERE ---
      // 3. If the user was just marked as verified, check their campaigns
      if (userIsNowVerified) {
        const campaignIds = updatedExperience.user.campaigns.map(c => c.campaignId);

        for (const campaignId of campaignIds) {
          // Count total members in the campaign
          const totalMembers = await tx.campaignUser.count({
            where: { campaignId: campaignId },
          });

          // Count verified members in the same campaign
          const verifiedMembers = await tx.user.count({
            where: {
              is_verified: true,
              campaigns: {
                some: { campaignId: campaignId },
              },
            },
          });

          // 4. If all members are verified, update the campaign status
          if (totalMembers > 0 && totalMembers === verifiedMembers) {
            await tx.campaign.update({
              where: { id: campaignId },
              // Use the enum value from your schema
              data: { status: 'Finished' }, 
            });
            console.log(`Campaign ID ${campaignId} automatically marked as Finished.`);
          }
        }
      }

      // Return the initially updated experience from the transaction
      return tx.workExperience.findUnique({ where: { id: numericId } });
    }, 
    // Increase timeouts for these potentially long-running transactions
    {
      maxWait: 10000,
      timeout: 20000,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("API POST Verify Experience Error:", error);
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update work experience.' }, { status: 500 });
  }
}