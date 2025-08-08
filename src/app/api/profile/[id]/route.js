// import { NextResponse } from 'next/server';
// import prisma from '@/app/lib/prisma';

// export async function GET(request, { params }) {
//   try {
//     const { id } = params;
//     const userId = parseInt(id, 10);

//     if (isNaN(userId)) {
//       return NextResponse.json({ error: 'Invalid user ID format.' }, { status: 400 });
//     }

//     const userProfile = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//       include: {
//         educations: true,
//         // We still need to fetch workExperiences to find the associated skills
//         workExperiences: {
//           include: {
//             skills: {
//               include: {
//                 skill: true, // This includes the full Skill model details
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!userProfile) {
//       return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
//     }

//     // --- NEW LOGIC: PROCESS AND FLATTEN THE SKILLS DATA ---
    
//     // Use a Map to store unique skills to prevent duplicates.
//     const uniqueSkills = new Map();

//     // Loop through each work experience
//     userProfile.workExperiences.forEach(experience => {
//       // Loop through the skills associated with that experience
//       experience.skills.forEach(workExperienceSkill => {
//         const skill = workExperienceSkill.skill;
//         if (skill && !uniqueSkills.has(skill.id)) {
//           // Add the full skill object to our map, using its ID as the key
//           uniqueSkills.set(skill.id, skill);
//         }
//       });
//     });

//     // Convert the Map of unique skills back into an array
//     const allSkills = Array.from(uniqueSkills.values());

//     // --- ATTACH the processed skills to the final response object ---
//     const finalProfileData = {
//       ...userProfile,
//       skills: allSkills, // Add the new top-level 'skills' array
//     };
    
//     // Return the complete profile data, now including the flattened skills array
//     console.log(finalProfileData)
//     return NextResponse.json(finalProfileData, { status: 200 });

//   } catch (error) {
//     console.error("API Profile Fetch Error:", error);
//     return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format.' }, { status: 400 });
    }

    // --- FIXED LOGIC ---

    // Step 1: Fetch the main user profile and their direct relations like education and work experience.
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        educations: true,
        // We include work experiences here but will fetch the skills separately for clarity and reliability.
        workExperiences: {
           include: {
            skills: {
              include: {
                skill: true, 
              },
            },
          },
        },
        company:{
          select:{
            name:true
          }
        }
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    // Step 2: Directly fetch all unique skills associated with this user's work experiences.
    // This is a more robust way to ensure all skill fields are included.
    const userSkills = await prisma.skill.findMany({
      where: {
        // Find skills where at least one of their workExperience relations
        // is linked to the current user's work experiences.
        workExperiences: {
          some: {
            workExperience: {
              userId: userId,
            },
          },
        },
      },
      // Explicitly select all fields from the Skill model to guarantee they are returned.
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
        skillType: true,
        endorsements: true,
        isVerified: true,
      },
    });

    // Step 3: Combine the user profile with the correctly fetched skills.
    const finalProfileData = {
      ...userProfile,
      skills: userSkills, // Overwrite with our direct, complete skill query.
    };
    
    // Return the complete and correctly structured profile data.
    // console.log(finalProfileData)
    return NextResponse.json(finalProfileData, { status: 200 });

  } catch (error) {
    console.error("API Profile Fetch Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}