import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import fetch from "node-fetch"; // for QStash


export async function POST(request) {
  try {
    const { experienceId, isVerified } = await request.json();
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId) || isVerified === undefined) {
      return NextResponse.json({ error: 'Missing or invalid experienceId or verification status.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Step A: Update the specific work experience
      const updatedExperience = await tx.workExperience.update({
        where: { id: numericId },
        data: { is_verified: isVerified , progress:'Verified'},
        select: { 
          userId: true,
          user: {
            select: {
              is_verified: true, // Select the user's CURRENT verification status
              campaigns: { select: { campaignId: true } }
            }
          }
        },
      });
try {
  const payload = {
    type: "progressUpdate",
    expId: updatedExperience.id, // Corrected from 'experienceId'
    userId: updatedExperience.userId,
    progress: `Verified for ${updatedExperience.companyName}`,
  };

  // The destination URL from your environment variables
  const deliveryUrl = process.env.QSTASH_DELIVERY_URL;

  // CONSTRUCT THE CORRECT PUBLISH URL HERE
  const publishUrl = `https://qstash.upstash.io/v2/publish/${deliveryUrl}`;

  await fetch(publishUrl, { // Use the newly constructed URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    },
    // The body now only needs to contain the payload for your worker
    body: JSON.stringify(payload), 
  });

  console.log(`Published HR Email update for experienceId=${updatedExperience.id}`);
} catch (err) {
  console.error("Failed to publish HR Email update to QStash:", err);
}

      const { userId } = updatedExperience;
      const userWasAlreadyVerified = updatedExperience.user.is_verified;

      // Step B: Check and update the user's overall verification status
      const totalExperiences = await tx.workExperience.count({ where: { userId: userId } });
      const unverifiedExperiences = await tx.workExperience.count({ where: { userId: userId, is_verified: false } });

      let userIsNowVerified = false;
      if (totalExperiences > 0 && unverifiedExperiences === 0) {
        await tx.user.update({ where: { id: userId }, data: { is_verified: true } });
        userIsNowVerified = true;
      } else {
        await tx.user.update({ where: { id: userId }, data: { is_verified: false } });
      }

      // --- REFINED CAMPAIGN LOGIC ---

      // Step C: Check campaign statuses ONLY if the user's status has just flipped from FALSE to TRUE.
      if (!userWasAlreadyVerified && userIsNowVerified) {
        const campaignIds = updatedExperience.user.campaigns.map(c => c.campaignId);

        for (const campaignId of campaignIds) {
          const totalMembers = await tx.campaignUser.count({ where: { campaignId: campaignId } });
          const verifiedMembers = await tx.user.count({ where: { is_verified: true, campaigns: { some: { campaignId: campaignId } } } });
          
          if (totalMembers > 0 && totalMembers === verifiedMembers) {
            await tx.campaign.update({
              where: { id: campaignId },
              data: { status: 'Finished' },
            });
            console.log(`Campaign ID ${campaignId} automatically marked as Finished.`);
          }
        }
      }
      // If a user becomes un-verified, we must also ensure their campaigns are not incorrectly marked as 'Finished'
      else if (userWasAlreadyVerified && !userIsNowVerified) {
          const campaignIds = updatedExperience.user.campaigns.map(c => c.campaignId);
          for (const campaignId of campaignIds) {
              await tx.campaign.update({
                  where: {id: campaignId },
                  data: { status: 'Active' }, // Revert status to Active
              });
              console.log(`Campaign ID ${campaignId} status reverted to Active.`);
          }
      }

      return tx.workExperience.findUnique({ where: { id: numericId } });
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("API Update Experience Status Error:", error);
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update work experience.' }, { status: 500 });
  }
}