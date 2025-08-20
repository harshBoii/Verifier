// File: /app/api/plans/calculate-price/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define your pricing constants here. In a real app, these might be in a database.
const BASE_PRICE = 10.00; // A base fee for any custom plan
const PRICE_PER_VERIFICATION = 0.50; // $0.50 per verification
const DEFAULT_FEATURE_COST = 5.00; // $5.00 for any feature that doesn't have a specific cost

export async function POST(request) {
  try {
    const body = await request.json();
    const { featureIds, verificationLimit } = body;

    if (!Array.isArray(featureIds) || verificationLimit === undefined) {
      return NextResponse.json({ error: 'Missing required fields: featureIds and verificationLimit.' }, { status: 400 });
    }

    // Fetch the features from the database to get their specific costs
    const features = await prisma.feature.findMany({
      where: {
        id: { in: featureIds },
      },
    });

    // Calculate the total cost of the selected features
    const featuresCost = features.reduce((total, feature) => {
      // Use the feature's specific cost if it exists, otherwise use the default
      return total + (parseFloat(feature.cost) || DEFAULT_FEATURE_COST);
    }, 0);

    // Calculate the cost of the verifications
    const verificationCost = parseInt(verificationLimit, 10) * PRICE_PER_VERIFICATION;

    // Calculate the total price
    const totalPrice = BASE_PRICE + featuresCost + verificationCost;

    return NextResponse.json({ totalPrice: totalPrice.toFixed(2) });

  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate price.' }, { status: 500 });
  }
}
