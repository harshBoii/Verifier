// import { NextResponse } from 'next/server';
// import prisma from '@/app/lib/prisma';

// export async function POST(request) {
//   try {
//     // 1. Get the experienceId and the new verification status from the request body
//     const { experienceId, isVerified } = await request.json();
//     const numericId = parseInt(experienceId, 10);

//     if (isNaN(numericId) || isVerified === undefined) {
//       return NextResponse.json({ error: 'Missing or invalid experienceId or verification status.' }, { status: 400 });
//     }

//     // 2. Use a transaction to group all related database operations
//     const result = await prisma.$transaction(async (tx) => {
//       // Step A: Update the specific work experience
//       const updatedExperience = await tx.workExperience.update({
//         where: { id: numericId },
//         data: { is_verified: isVerified },
//         select: { 
//           userId: true,
//           // Eagerly load the user's campaign memberships for later use
//           user: {
//             select: {
//               campaigns: { select: { campaignId: true } }
//             }
//           }
//         },
//       });
      
//       const { userId } = updatedExperience;

//       // --- USER VERIFICATION LOGIC ---
      
//       // Step B: Check the user's overall verification status
//       const totalExperiences = await tx.workExperience.count({ where: { userId: userId } });
//       const unverifiedExperiences = await tx.workExperience.count({ where: { userId: userId, is_verified: false } });

//       let userIsNowVerified = false;
//       if (totalExperiences > 0 && unverifiedExperiences === 0) {
//         await tx.user.update({ where: { id: userId }, data: { is_verified: true } });
//         userIsNowVerified = true;
//       } else {
//         await tx.user.update({ where: { id: userId }, data: { is_verified: false } });
//       }

//       // --- CAMPAIGN COMPLETION LOGIC ---

//       // Step C: Check campaign statuses ONLY if the user's status changed to verified OR if we just un-verified an experience
//       if (userIsNowVerified || !isVerified) {
//         const campaignIds = updatedExperience.user.campaigns.map(c => c.campaignId);

//         for (const campaignId of campaignIds) {
//           const totalMembers = await tx.campaignUser.count({ where: { campaignId: campaignId } });
//           const verifiedMembers = await tx.user.count({ where: { is_verified: true, campaigns: { some: { campaignId: campaignId } } } });
          
//           if (totalMembers > 0 && totalMembers === verifiedMembers) {
//             // All members are verified, mark campaign as 'Finished'
//             await tx.campaign.update({
//               where: { id: campaignId },
//               data: { status: 'Finished' },
//             });
//             console.log(`Campaign ID ${campaignId} automatically marked as Finished.`);
//           } else {
//             // Not all members are verified, ensure campaign is 'Active'
//             await tx.campaign.update({
//               where: { id: campaignId },
//               data: { status: 'Active' },
//             });
//             console.log(`Campaign ID ${campaignId} status set to Active.`);
//           }
//         }
//       }

//       // Return the initially updated experience record
//       return tx.workExperience.findUnique({ where: { id: numericId } });
//     }, 
//     // Add timeouts for this potentially long-running, multi-step transaction
//     {
//       maxWait: 15000,
//       timeout: 30000,
//     });

//     return NextResponse.json(result, { status: 200 });

//   } catch (error) {
//     console.error("API Update Experience Status Error:", error);
//     if (error.code === 'P2025') {
//         return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
//     }
//     return NextResponse.json({ error: 'Failed to update work experience.' }, { status: 500 });
//   }
// }


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
        data: { is_verified: isVerified },
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