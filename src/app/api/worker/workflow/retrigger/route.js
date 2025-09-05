import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Client } from '@upstash/qstash';

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

/**
 * This API route retriggers a workflow for a given workExperienceId
 * by resetting its progress and enqueueing the first job.
 */
export async function POST(request) {
  try {
    // For production, you would add authentication here to ensure
    // only authorized users can retrigger workflows.
    const { workExperienceId } = await request.json();

    if (!workExperienceId) {
      return NextResponse.json(
        { error: 'workExperienceId is required' },
        { status: 400 }
      );
    }

    // Step 1: Find the existing progress record for this work experience.
    // We need to include the related workflow to find the ID of the "START" node.
    const progress = await prisma.workExperienceWorkflowProgress.findFirst({
      where: {
        workExperienceId: parseInt(workExperienceId, 10),
      },
      include: {
        workflow: {
          include: {
            // Find the start node within the workflow
            nodes: {
              where: { type: 'START' },
              take: 1,
            },
          },
        },
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: `No workflow progress found for work experience ID ${workExperienceId}.` },
        { status: 404 }
      );
    }

    const startNode = progress.workflow?.nodes[0];
    if (!startNode) {
      return NextResponse.json(
        { error: `Could not find a START node for workflow ID ${progress.workflowId}.` },
        { status: 500 }
      );
    }

    // Step 2: Use a database transaction to safely reset the state.
    // This ensures both the progress and the experience itself are updated together.
    await prisma.$transaction(async (tx) => {
      // Reset the main work experience status to an initial state
      // Reset the workflow progress record to point back to the start node
      await tx.workExperienceWorkflowProgress.update({
        where: { id: progress.id },
        data: {
          status: 'in_progress',
          currentNodeId: startNode.id,
          completedAt: null, // Clear any previous completion date
        },
      });
    });

    // Step 3: Enqueue a new job in QStash to start the workflow from the beginning.
    await qstashClient.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
      body: { progressId: progress.id },
    });

    return NextResponse.json({
      message: `Workflow for work experience #${workExperienceId} has been successfully retriggered.`,
    });

  } catch (error) {
    console.error("Error retriggering workflow:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
