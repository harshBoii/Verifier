// import { NextResponse } from 'next/server';
// import prisma from '@/app/lib/prisma';
// import { Client } from '@upstash/qstash';

// const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

// /**
//  * This API route retriggers a workflow for a given workExperienceId
//  * by resetting its progress and enqueueing the first job.
//  */
// export async function POST(request) {
//   try {
//     // For production, you would add authentication here to ensure
//     // only authorized users can retrigger workflows.
//     const { workExperienceId } = await request.json();

//     if (!workExperienceId) {
//       return NextResponse.json(
//         { error: 'workExperienceId is required' },
//         { status: 400 }
//       );
//     }

//     // Step 1: Find the existing progress record for this work experience.
//     // We need to include the related workflow to find the ID of the "START" node.
//     const progress = await prisma.workExperienceWorkflowProgress.findFirst({
//       where: {
//         workExperienceId: parseInt(workExperienceId, 10),
//       },
//       include: {
//         workflow: {
//           include: {
//             // Find the start node within the workflow
//             nodes: {
//               where: { type: 'START' },
//               take: 1,
//             },
//           },
//         },
//       },
//     });

//     if (!progress) {
//       return NextResponse.json(
//         { error: `No workflow progress found for work experience ID ${workExperienceId}.` },
//         { status: 404 }
//       );
//     }

//     const startNode = progress.workflow?.nodes[0];
//     if (!startNode) {
//       return NextResponse.json(
//         { error: `Could not find a START node for workflow ID ${progress.workflowId}.` },
//         { status: 500 }
//       );
//     }

//     // Step 2: Use a database transaction to safely reset the state.
//     // This ensures both the progress and the experience itself are updated together.
//     await prisma.$transaction(async (tx) => {
//       // Reset the main work experience status to an initial state
//       // Reset the workflow progress record to point back to the start node
//       await tx.workExperienceWorkflowProgress.update({
//         where: { id: progress.id },
//         data: {
//           status: 'in_progress',
//           currentNodeId: startNode.id,
//           completedAt: null, // Clear any previous completion date
//         },
//       });
//     });

//     // Step 3: Enqueue a new job in QStash to start the workflow from the beginning.
//     await qstashClient.publishJSON({
//       url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
//       body: { progressId: progress.id },
//     });

//     return NextResponse.json({
//       message: `Workflow for work experience #${workExperienceId} has been successfully retriggered.`,
//     });

//   } catch (error) {
//     console.error("Error retriggering workflow:", error);
//     return NextResponse.json(
//       { error: 'An internal server error occurred.' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Client } from '@upstash/qstash';

const qstashClient = new Client({ token: process.env.QSTASH_TOKEN });

/**
 * This API route retriggers a workflow for a given workExperienceId,
 * allowing it to be started on any specified workflowId.
 */
export async function POST(request) {
  try {
    // For production, you would add authentication here
    const { workExperienceId, workflowId } = await request.json();

    if (!workExperienceId || !workflowId) {
      return NextResponse.json(
        { error: 'Both workExperienceId and workflowId are required' },
        { status: 400 }
      );
    }

    // Step 1: Find the target workflow and its START node.
    const targetWorkflow = await prisma.workflow.findUnique({
      where: { id: parseInt(workflowId, 10) },
      include: {
        nodes: {
          where: { type: 'START' },
          take: 1,
        },
      },
    });

    if (!targetWorkflow) {
        return NextResponse.json(
            { error: `Workflow with ID ${workflowId} not found.` },
            { status: 404 }
        );
    }

    const startNode = targetWorkflow.nodes[0];
    if (!startNode) {
      return NextResponse.json(
        { error: `Could not find a START node for workflow ID ${workflowId}.` },
        { status: 500 }
      );
    }

    // Step 2: Use `upsert` to find an existing progress record or create a new one.
    // This is the key to allowing any workflow to be triggered.
    const progress = await prisma.workExperienceWorkflowProgress.upsert({
        where: {
            // A unique constraint on both fields is needed in your schema for this to work
            workExperienceId_workflowId: {
                workExperienceId: parseInt(workExperienceId, 10),
                workflowId: parseInt(workflowId, 10),
            },
        },
        // If it exists, update it to the reset state
        update: {
            status: 'in_progress',
            currentNodeId: startNode.id,
            completedAt: null,
        },
        // If it doesn't exist, create it in the reset state
        create: {
            workExperienceId: parseInt(workExperienceId, 10),
            workflowId: parseInt(workflowId, 10),
            status: 'in_progress',
            currentNodeId: startNode.id,
        },
    });

    // Step 3: We still want to reset the main work experience status.
    await prisma.workExperience.update({
        where: { id: parseInt(workExperienceId, 10) },
        data: {
          progress: 'Beginning', // Or your desired initial status
          mail_sent: false,
          verified_at: null,
          verified_by: null,
          hr_comment: null,
        },
    });

    // Step 4: Enqueue the QStash job with the ID of the (potentially new) progress record.
    await qstashClient.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/workflow`,
      body: { progressId: progress.id },
    });

    return NextResponse.json({
      message: `Workflow #${workflowId} successfully initiated for work experience #${workExperienceId}.`,
    });

  } catch (error) {
    console.error("Error retriggering workflow:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
