// In app/api/workflow/start/route.js

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Client } from '@upstash/qstash';

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

export async function POST(request) {
  try {
    const { workExperienceId, workflowId } = await request.json();

    if (!workExperienceId || !workflowId) {
      return NextResponse.json({ error: 'workExperienceId and workflowId are required' }, { status: 400 });
    }

    // 1. Find the START node of the workflow (this logic is unchanged)
    const startNode = await prisma.workflowNode.findFirst({
      where: { workflowId: workflowId, type: 'START' },
      include: { sourceEdges: true },
    });

    if (!startNode || !startNode.sourceEdges.length) {
      return NextResponse.json({ error: 'Workflow start node or initial edge not found' }, { status: 404 });
    }
    const firstNodeId = startNode.sourceEdges[0].targetNodeId;

    // 2. Use `upsert` to safely create or find the progress record.
    // This is the key change to prevent the unique constraint error.
    const progress = await prisma.workExperienceWorkflowProgress.upsert({
      where: {
        // This is the composite unique key
        workExperienceId_workflowId: {
          workExperienceId,
          workflowId,
        },
      },
      // If a record is found, do nothing to it.
      update: {}, 
      // If no record is found, create a new one.
      create: {
        workExperienceId,
        workflowId,
        currentNodeId: firstNodeId,
        status: 'in-progress',
      },
    });

    // 3. Enqueue the first job to be processed by our worker.
    // This part is safe to run multiple times. If the job is already in progress,
    // this might re-trigger the first step, which is often acceptable.
    await qstashClient.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
      body: { progressId: progress.id },
    });

    return NextResponse.json({
      message: 'Workflow started or already in progress.',
      progressId: progress.id,
    }, { status: 202 });

  } catch (error) {
    console.error("Error starting workflow:", error);
    // Handle the specific P2002 error gracefully, just in case.
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A race condition occurred. Please try again.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to start workflow' }, { status: 500 });
  }
}
