import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request, { params }) {
  const { experienceId } = params;

  if (!experienceId) {
    return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
  }

  try {
    const numericId = parseInt(experienceId, 10);
    if (isNaN(numericId)) {
        return NextResponse.json({ error: 'Invalid Experience ID format' }, { status: 400 });
    }
    
    // Fetch all workflow progress records for a given work experience
    const workflowProgresses = await prisma.workExperienceWorkflowProgress.findMany({
      where: {
        workExperienceId: numericId,
      },
      include: {
        // Include the full workflow details for each progress record
        workflow: {
          include: {
            company: true, // Also include the company for context
          },
        },
      },
      orderBy: {
        startedAt: 'desc', // Show the most recent workflows first
      },
    });

    if (!workflowProgresses) {
      return NextResponse.json({ error: 'No workflows found for this experience' }, { status: 404 });
    }

    return NextResponse.json(workflowProgresses);
  } catch (error) {
    console.error("Failed to fetch workflows for experience:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(request, { params }) {
  const { experienceId } = params;
  const { workflowId } = await request.json();

  if (!experienceId || !workflowId) {
    return NextResponse.json({ error: 'Experience ID and Workflow ID are required' }, { status: 400 });
  }

  try {
    const numericExperienceId = parseInt(experienceId, 10);

    // 1. Find the starting node of the selected workflow
    const startNode = await prisma.workflowNode.findFirst({
      where: {
        workflowId: workflowId,
        type: 'START', // Assumes your start nodes have this type
      },
    });

    if (!startNode) {
      return NextResponse.json({ error: 'Workflow has no defined start node.' }, { status: 400 });
    }

    // 2. Check if this workflow is already assigned to this experience
    const existingProgress = await prisma.workExperienceWorkflowProgress.findUnique({
      where: {
        workExperienceId_workflowId: {
          workExperienceId: numericExperienceId,
          workflowId: workflowId,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json({ error: 'This workflow is already active for this experience.' }, { status: 409 }); // 409 Conflict
    }

    // 3. Create the progress record to assign the workflow
    const newProgress = await prisma.workExperienceWorkflowProgress.create({
      data: {
        workExperienceId: numericExperienceId,
        workflowId: workflowId,
        currentNodeId: startNode.id,
        status: 'in-progress',
        // Optional: Set startedAt or other initial data
      },
    });

    return NextResponse.json({ message: 'Workflow assigned successfully!', data: newProgress }, { status: 201 });

  } catch (error) {
    console.error("Failed to assign workflow:", error);
    // Handle potential Prisma errors, e.g., if a foreign key constraint fails
    if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Invalid Experience ID or Workflow ID.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
