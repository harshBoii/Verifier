import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();


export async function GET(request, { params }) {
  try {
    const { id } = params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format.' }, { status: 400 });
    }

    const cached = await redis.get(`user:${userId}`);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
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

    const userSkills = await prisma.skill.findMany({
      where: {
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
    console.log(finalProfileData)
    await redis.set(`user:${userId}`, userProfile, { ex: 900 });

    return NextResponse.json(finalProfileData, { status: 200 });

  } catch (error) {
    console.error("API Profile Fetch Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const userId = parseInt(id, 10);

    // Validate the user ID
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format.' }, { status: 400 });
    }

    // Get the updated data from the request body
    const body = await request.json();
    
    console.log("dp id " , body.profilePicture)
    // Destructure the fields you want to allow updates for.
    // This prevents unwanted fields from being updated.
    const { 
      fullName, 
      username, 
      dob, 
      gender, 
      mobile, 
      summary, 
      linkedin, 
      github, 
      website 
    } = body;

    // Use Prisma to update the user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        profilePicture: body.profilePicture, // save the URL
        dob: dob ? new Date(dob) : undefined, // Ensure dob is a Date object
        gender,
        mobile,
        summary,
        linkedin,
        github,
        website,
      },
    });

    // Return the updated user data
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error("API Profile Update Error:", error);
    // Handle specific Prisma errors if necessary, e.g., record not found
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const id = parseInt(params.id); // params is available here

  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return Response.json(deletedUser);
}
