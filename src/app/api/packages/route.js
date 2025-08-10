import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * A helper function to transform the database plan model into the structure
 * the frontend component expects.
 */
const transformPlanForFrontend = (plan, billingCycle) => {
    const isMonthly = billingCycle === 'monthly';
    
    const features = [
        { text: `Verification Limited (${plan.verificationLimit})`, included: true },
        { text: 'Custom Mail config (SMTP)', included: plan.hasCustomSmtp },
        { text: 'Set your rates', included: plan.canSetRates },
        { text: 'Agent Connect', included: plan.hasAgentConnect },
        { text: 'Advanced Statistics', included: plan.hasAdvancedStats },
    ];

    const isPrimary = plan.name.toLowerCase() === 'primary';

    return {
        id: plan.id,
        name: plan.name,
        price: isMonthly ? plan.priceMonthly : plan.priceAnnually,
        features: features,
        isPrimary: isPrimary,
        saveAmount: isPrimary && !isMonthly ? 50 : (isPrimary && isMonthly ? 40 : null),
    };
};

/**
 * Handles GET requests to fetch all pricing plans from the database.
 */
export async function GET() {
  try {
    const plansFromDB = await prisma.plan.findMany();

    const responseData = {
        monthly: plansFromDB.map(plan => transformPlanForFrontend(plan, 'monthly')),
        annually: plansFromDB.map(plan => transformPlanForFrontend(plan, 'annually')),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Get Packages Error:", error);
    return NextResponse.json({ error: 'Failed to fetch packages.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to CREATE a new pricing plan.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, priceMonthly, priceAnnually, ...features } = body;

        if (!name || priceMonthly === undefined || priceAnnually === undefined) {
            return NextResponse.json({ error: 'Name and prices are required.' }, { status: 400 });
        }

        const newPlan = await prisma.plan.create({
            data: {
                name,
                priceMonthly,
                priceAnnually,
                verificationLimit: 5,
                hasCustomSmtp: features.hasCustomSmtp || false,
                canSetRates: features.canSetRates || false,
                hasAgentConnect: features.hasAgentConnect || false,
                hasAdvancedStats: features.hasAdvancedStats || false,
            },
        });

        return NextResponse.json(newPlan, { status: 201 });

    } catch (error) {
        console.error("API Create Package Error:", error);
        return NextResponse.json({ error: 'Failed to create package.' }, { status: 500 });
    }
}

/**
 * Handles PUT requests to UPDATE existing pricing plans.
 */
export async function PUT(request) {
    try {
        const updatedPlans = await request.json();
        const monthlyPlans = updatedPlans.monthly;

        const updatePromises = monthlyPlans.map(plan => {
            return prisma.plan.update({
                where: { id: plan.id },
                data: {
                    name: plan.name,
                    priceMonthly: plan.price,
                    hasCustomSmtp: plan.features.find(f => f.text.includes('SMTP'))?.included || false,
                    canSetRates: plan.features.find(f => f.text.includes('rates'))?.included || false,
                    hasAgentConnect: plan.features.find(f => f.text.includes('Agent'))?.included || false,
                    hasAdvancedStats: plan.features.find(f => f.text.includes('Statistics'))?.included || false,
                },
            });
        });

        await prisma.$transaction(updatePromises);
        
        return NextResponse.json({ message: 'Packages updated successfully!' });
    } catch (error) {
        console.error("API Update Packages Error:", error);
        return NextResponse.json({ error: 'Failed to update packages.' }, { status: 500 });
    }
}
