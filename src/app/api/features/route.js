// File: /app/api/features/route.js

import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Handle GET Requests to Fetch All Features ---
export async function GET(request) {
  try {
    const features = await prisma.feature.findMany({
      orderBy: {
        name: 'asc', // Order features alphabetically
      },
    });
    // Use NextResponse to return JSON with a 200 status
    return NextResponse.json(features, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch features:', error);
    return NextResponse.json({ error: 'Failed to fetch features.' }, { status: 500 });
  }
}

// --- Handle POST Requests to Create a New Feature ---
export async function POST(request) {
  try {
    // The request body must be parsed from the request object
    const body = await request.json();
    const { name, description, cost } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json({ error: 'Feature name is required.' }, { status: 400 });
    }

    const newFeature = await prisma.feature.create({
      data: {
        name,
        description,
        cost: cost ? parseFloat(cost) : undefined,
      },
    });
    // Return the new feature with a 201 status code
    return NextResponse.json(newFeature, { status: 201 });

  } catch (error) {
    // Handle potential duplicate name errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json({ error: `A feature with this ${field} already exists.` }, { status: 409 });
    }
    console.error('Failed to create feature:', error);
    return NextResponse.json({ error: 'Failed to create feature.' }, { status: 500 });
  }
}
