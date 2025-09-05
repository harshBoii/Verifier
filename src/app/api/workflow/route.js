// In app/api/workflow/route.js

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// --- POST for Creating a New Workflow ---
export async function POST(request) {
  try {
    const { name, description, companyId, nodes, edges } = await request.json();

    if (!name || !companyId || !nodes || !edges) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newWorkflow = await prisma.$transaction(async (tx) => {
      // 1. Create the parent Workflow
      const workflow = await tx.workflow.create({
        data: { name, description, companyId },
      });

      // 2. Create the nodes
      if (nodes.length > 0) {
        await tx.workflowNode.createMany({
          data: nodes.map(node => ({
            ...node,
            workflowId: workflow.id,
          })),
        });
      }

      // 3. Create the edges
      if (edges.length > 0) {
        await tx.workflowEdge.createMany({
          data: edges.map(edge => ({
            ...edge,
            workflowId: workflow.id,
          })),
        });
      }

      return workflow;
    });

    return NextResponse.json(newWorkflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A resource with the same unique identifier already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// --- PUT for Updating an Existing Workflow ---
export async function PUT(request) {
  try {
    const { id, name, description, nodes, edges } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required for an update' }, { status: 400 });
    }

    const updatedWorkflow = await prisma.$transaction(async (tx) => {
      // 1. Update the main workflow details
      const workflow = await tx.workflow.update({
        where: { id },
        data: { name, description },
      });

      // 2. Delete all existing nodes and edges to prevent conflicts
      await tx.workflowEdge.deleteMany({ where: { workflowId: id } });
      await tx.workflowNode.deleteMany({ where: { workflowId: id } });

      // 3. Create the new set of nodes and edges from the UI
      if (nodes.length > 0) {
        await tx.workflowNode.createMany({
          data: nodes.map(node => ({
            ...node,
            workflowId: id,
          })),
        });
      }

      if (edges.length > 0) {
        await tx.workflowEdge.createMany({
          data: edges.map(edge => ({
            ...edge,
            workflowId: id,
          })),
        });
      }

      return workflow;
    });

    return NextResponse.json(updatedWorkflow, { status: 200 });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId query parameter is required' },
        { status: 400 }
      );
    }

    const workflows = await prisma.workflow.findMany({
      where: {
        companyId: parseInt(companyId, 10),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ workflows });

  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}