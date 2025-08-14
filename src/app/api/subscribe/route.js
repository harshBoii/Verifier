import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import { cookies } from 'next/headers';

/**
 * Handles GET requests to fetch the current subscription for the logged-in user's company.
 */
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
            where: { companyId: companyId },
            include: {
                plan: true, // Include the details of the subscribed plan
            },
        });

        if (!subscription) {
            return NextResponse.json(null, { status: 200 }); // Return null if no subscription found
        }

        return NextResponse.json(subscription);

    } catch (error) {
        console.error("API Get Subscription Error:", error);
        return NextResponse.json({ error: 'Failed to fetch subscription details.' }, { status: 500 });
    }
}


/**
 * Handles POST requests to create or update a subscription for a company.
 */
export async function POST(request) {
  try {
    const { companyId, planId, billingCycle } = await request.json();

    if (!companyId || !planId || !billingCycle) {
      return NextResponse.json({ error: 'Company ID, Plan ID, and billing cycle are required.' }, { status: 400 });
    }
    
    const numericCompanyId = parseInt(companyId, 10);
    const numericPlanId = parseInt(planId, 10);

    const currentPeriodEnds = new Date();
    if (billingCycle === 'annually') {
      currentPeriodEnds.setFullYear(currentPeriodEnds.getFullYear() + 1);
    } else {
      currentPeriodEnds.setMonth(currentPeriodEnds.getMonth() + 1);
    }

    const subscription = await prisma.subscription.upsert({
      where: { companyId: numericCompanyId },
      update: {
        planId: numericPlanId,
        isActive: true,
        currentPeriodEnds,
      },
      create: {
        companyId: numericCompanyId,
        planId: numericPlanId,
        isActive: true,
        currentPeriodEnds,
      },
    });

    return NextResponse.json(subscription, { status: 201 });

  } catch (error) {
    console.error("API Subscribe Error:", error);
    return NextResponse.json({ error: 'Failed to create or update subscription.' }, { status: 500 });
  }
}
