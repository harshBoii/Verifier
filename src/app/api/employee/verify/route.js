import { NextResponse } from "next/server";

import prisma from "@/app/lib/prisma";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Employee ID required" }, { status: 400 });
    }

    // Get user with work experiences
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { workExperiences: true , 
      campaigns:{
      include: { campaign: true }, // 👈 this gets the actual Campaign data
    },},
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If user has work experiences, block verification
    if (user.workExperiences.length > 0) {
      return NextResponse.json(
        { message: "Verify all the individual experience" },
        { status: 400 }
      );
    }

    // Otherwise, mark verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { is_verified: true },
    });

    for (const campaignUser of user.campaigns) {
      const campaignId = campaignUser.campaignId;

      // Count unfinished users in this campaign
      const notVerifiedCount = await prisma.user.count({
        where: {
          campaigns: {
            some: { campaignId }, // users in this campaign
          },
          is_verified: false, // or use whatever flag means unfinished
        },
      });

      if (notVerifiedCount === 0) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "Finished" },
        });
      }
    }

    return NextResponse.json(
      { message: "User verified successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
