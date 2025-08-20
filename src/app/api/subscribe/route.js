// File: /app/api/subscribe/route.js

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import { cookies } from 'next/headers';

// GET method remains the same
export async function GET(request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const companyId = payload.companyId;

    if (!companyId) {
      return NextResponse.json({ error: 'User is not associated with a company.' }, { status: 404 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: {
          include: {
            planFeatures: {
              include: { feature: true },
            },
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("API Get Subscription Error:", error);
    return NextResponse.json({ error: 'Failed to fetch subscription details.' }, { status: 500 });
  }
}

// POST method is updated to handle custom plans
export async function POST(request) {
  try {
    const { companyId, planId, billingCycle, customPlanDetails } = await request.json();

    if (!companyId || !planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Company ID, Plan ID, and billing cycle are required.' },
        { status: 400 }
      );
    }
    
    let finalPlanId;
    let verificationLimit = 0;

    // --- Logic to handle custom plans ---
    if (planId === 'custom') {
      if (!customPlanDetails) {
        return NextResponse.json({ error: 'customPlanDetails are required for a custom plan.' }, { status: 400 });
      }

      const { name, featureIds, verificationLimit: customVerificationLimit, priceMonthly } = customPlanDetails;

      // Validate the custom plan details
      if (!name || !Array.isArray(featureIds) || customVerificationLimit === undefined) {
        return NextResponse.json({ error: 'Invalid custom plan details provided.' }, { status: 400 });
      }

      // Create the new custom plan and its features in a single transaction
      const newCustomPlan = await prisma.plan.create({
        data: {
          name: `${name} (Custom)`, // Append (Custom) to distinguish it
          priceMonthly: priceMonthly || 0, // Use calculated price or default to 0
          priceAnnually: (priceMonthly || 0) * 10, // Example annual price logic
          verificationLimit: customVerificationLimit,
          planFeatures: {
            create: featureIds.map(id => ({
              feature: { connect: { id: parseInt(id, 10) } },
              isIncluded: true,
            })),
          },
        },
      });
      
      finalPlanId = newCustomPlan.id;
      verificationLimit = newCustomPlan.verificationLimit;

    } else {
      // --- Logic for standard, pre-existing plans ---
      finalPlanId = parseInt(planId, 10);
      const standardPlan = await prisma.plan.findUnique({ where: { id: finalPlanId } });
      if (!standardPlan) {
        return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
      }
      verificationLimit = standardPlan.verificationLimit;
    }



    // Calculate the subscription end date
    const currentPeriodEnds = new Date();
    if (billingCycle === 'annually') {
      currentPeriodEnds.setFullYear(currentPeriodEnds.getFullYear() + 1);
    } else {
      currentPeriodEnds.setMonth(currentPeriodEnds.getMonth() + 1);
    }

    // Use prisma.subscription.upsert to create or update the subscription
    const subscription = await prisma.subscription.upsert({
      where: { companyId: parseInt(companyId, 10) },
      update: {
        planId: finalPlanId,
        isActive: true,
        currentPeriodEnds,
        // When updating, you might want to add to the existing verifications
        verifications_left: {
          increment: verificationLimit,
        },
      },
      create: {
        companyId: parseInt(companyId, 10),
        planId: finalPlanId,
        isActive: true,
        currentPeriodEnds,
        verifications_left: verificationLimit,
      },
    });

    return NextResponse.json(subscription, { status: 201 });

  } catch (error) {
    console.error("API Subscribe Error:", error);
    // Handle potential Prisma errors, e.g., foreign key constraint
    if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Invalid company or plan ID.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create or update subscription.' }, { status: 500 });
  }
}
