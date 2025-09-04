import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request, { params }) { // <-- This line is fixed
  try {
    const { experienceId } = params; // This now works correctly
    const { data } = await request.json();
    const hrEmail = data.verifier_email
    const ver_relation = data.ver_relation
    console.log("data is " , data)
    console.log("Ver Relation is ",ver_relation)
    console.log("Hr Email Is ",hrEmail)

    if (!hrEmail) {
      return NextResponse.json({ error: 'HR Email is required.' }, { status: 400 });
    }
    
    const numericId = parseInt(experienceId, 10);
    if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid Experience ID format.' }, { status: 400 });
    }

    const updatedExperience = await prisma.workExperience.update({
      where: {
        id: numericId,
      },
      data: {
        verifier_email: hrEmail,
        ver_relation:ver_relation,
        progress:'Email_added'
      },
    });

    // --- Publish job to QStash ---
    // try {
    //   const payload = {
    //     type: "progressUpdate",
    //     expId: updatedExperience.id,
    //     userId: updatedExperience.userId,
    //     progress: updatedExperience.progress,
    //   };

    //   await fetch("https://qstash.upstash.io/v2/publish/progress-updates", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    //     },
    //     body: JSON.stringify({
    //       body: payload,
    //       delivery: {
    //         url: process.env.QSTASH_DELIVERY_URL, // your worker route
    //       },
    //     }),
    //   });

    //   console.log(`Published HR Email update for experienceId=${updatedExperience.id}`);
    // } catch (err) {
    //   console.error("Failed to publish HR Email update to QStash:", err);
    // }
    // --- Publish job to QStash ---
try {
  const payload = {
    type: "progressUpdate",
    expId: updatedExperience.id, // Corrected from 'experienceId'
    userId: updatedExperience.userId,
    progress: `Verifier Email Updated for ${updatedExperience.companyName}`,
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


    return NextResponse.json({ message: 'HR Email updated successfully!', data: updatedExperience });
  } catch (error) {
    console.error("API Update HR Email Error:", error);
    // This will now correctly handle cases where the ID is not found in the DB
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update HR email.' }, { status: 500 });
  }
}
