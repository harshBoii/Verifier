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
    const searchTerm = searchParams.get('name') || undefined; // use undefined instead of ''

    const companies = await prisma.company.findMany({
      where: searchTerm
        ? {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          }
        : {}, // if no search, return all companies
      include: {
        admin: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const companiesData = companies.map((company) => ({
      id: company.id,
      name: company.name,
      type: company.type,
      adminName: company.admin?.fullName || 'N/A',
      adminEmail: company.admin?.email || 'N/A',
      package: company.subscription?.plan?.name || 'N/A',
      remaining: calculateRemainingDays(company.subscription?.currentPeriodEnds),
    }));

    return NextResponse.json({ success: true, data: companiesData });
  } catch (error) {
    console.error('API Search Companies Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies.' },
      { status: 500 }
    );
  }
}
