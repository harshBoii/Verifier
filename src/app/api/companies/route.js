import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Helper function to calculate the remaining days on a subscription.
 */
const calculateRemainingDays = (endDate) => {
    if (!endDate) return 'N/A';
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Expired';
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('name') || '';

    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        admin: true,
        // Include subscription details and the related plan
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    // Process the data to include the subscription details
    const companiesData = companies.map(company => ({
      id: company.id,
      companyName: company.name,
      adminName: company.admin?.fullName || 'N/A',
      adminEmail: company.admin?.email || 'N/A',
      // Get the package name from the subscription, or provide a default
      package: company.subscription?.plan?.name || 'N/A',
      // Calculate the remaining days
      remaining: calculateRemainingDays(company.subscription?.currentPeriodEnds),
    }));

    return NextResponse.json(companiesData);

  } catch (error) {
    console.error("API Search Companies Error:", error);
    return NextResponse.json({ error: 'Failed to search for companies.' }, { status: 500 });
  }
}
