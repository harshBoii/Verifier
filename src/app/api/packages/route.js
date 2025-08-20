// File: /app/api/plans/route.js

import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Handle GET Requests to Fetch All Plans ---
export async function GET(request) {
  try {
    const plans = await prisma.plan.findMany({
      // Include all related features for each plan
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
      orderBy: {
        priceMonthly: 'asc',
      },
    });
    const PlanToSend = plans.filter(i=>!/Custom/.test(i.name ))
    console.log(PlanToSend)
    return NextResponse.json(PlanToSend, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json({ error: 'An internal server error occurred while fetching plans.' }, { status: 500 });
  }
}

// --- Handle POST Requests to Create a New Plan ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      priceMonthly, 
      priceAnnually, 
      verificationLimit, 
      featureIds 
    } = body;

    // --- Input Validation ---
    if (!name || priceMonthly === undefined || priceAnnually === undefined || verificationLimit === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, priceMonthly, priceAnnually, and verificationLimit are required.' 
      }, { status: 400 });
    }
    if (!Array.isArray(featureIds)) {
      return NextResponse.json({ error: 'featureIds must be an array of numbers.' }, { status: 400 });
    }

    // --- Database Operation ---
    const newPlan = await prisma.plan.create({
      data: {
        name,
        priceMonthly,
        priceAnnually,
        verificationLimit: parseInt(verificationLimit, 10),
        planFeatures: {
          create: featureIds.map(id => ({
            feature: { connect: { id: parseInt(id, 10) } },
            isIncluded: true,
          })),
        },
      },
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    return NextResponse.json(newPlan, { status: 201 });

  } catch (error) {
    console.error('Failed to create plan:', error);

    // --- Error Handling ---
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint failed
        return NextResponse.json({ error: `A plan with the name "${error.meta.target}" already exists.` }, { status: 409 });
      }
      if (error.code === 'P2025') { // Foreign key constraint failed
        return NextResponse.json({ error: 'One of the provided feature IDs is invalid and does not exist.' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'An internal server error occurred while creating the plan.' }, { status: 500 });
  }
}
