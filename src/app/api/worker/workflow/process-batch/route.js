import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Client } from '@upstash/qstash';
import pLimit from 'p-limit'; // <-- Import p-limit

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

// Create a limiter that will execute at most 10 transactions concurrently.
// This is a safe number for most database connection pools.
const limit = pLimit(10); 

// This worker processes one batch of records.
export async function POST(request) {
  try {
    // Note: Add QStash signature verification here for production
    const { companyId, workflowId, page, pageSize } = await request.json();

    const experiencesToProcess = await prisma.workExperience.findMany({
        where: {
            user: { 
            companyId: parseInt(companyId, 10), // And then on the user's companyId
            },
        progress: { in: ['Email_added', 'Mail_sent'] }, // ✅ correct enum values
      },
      skip: page * pageSize,
      take: pageSize,
      select: { id: true },
    });

    // Step 2: Use the limiter to control transaction concurrency.
    // We map each experience to a function that the limiter will execute.
    const processingPromises = experiencesToProcess.map(experience => {
      // limit() returns a function that returns a promise.
      // p-limit ensures that no more than 10 of these will be running at any given time.
      return limit(() => prisma.$transaction(async (tx) => {
        // First, update the status to make this operation idempotent
        // await tx.workExperience.update({
        //   where: { id: experience.id },
        //   data: { status: 'Verification_In_Progress' },
        // });

        // Now that it's "locked", find its progress record
        const progress = await tx.workExperienceWorkflowProgress.findFirst({
          where: { workExperienceId: experience.id, workflowId: parseInt(workflowId, 10) },
          select: { id: true },
        });

        if (progress) {
          // Enqueue the job for the main worker
          return qstashClient.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
            body: { progressId: progress.id },
          });
        }
      }));
    });

    await Promise.all(processingPromises);

    return NextResponse.json({
      message: `Successfully enqueued batch page ${page} with ${experiencesToProcess.length} records.`,
    });

  } catch (error) {
    console.error(`Error processing batch page:`, error);
    return NextResponse.json({ error: 'Failed to process batch' }, { status: 500 });
  }
}
