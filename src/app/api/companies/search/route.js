import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

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
      },
    });

    const companiesData = companies.map(company => ({
      id: company.id,
      companyName: company.name,
      adminName: company.admin?.fullName || 'N/A',
      adminEmail: company.admin?.email || 'N/A',
      package: 'Gold',
      remaining: '24 days',
    }));

    return NextResponse.json(companiesData);
  } catch (error) {
    console.error("API Search Companies Error:", error);
    return NextResponse.json({ error: 'Failed to search companies.' }, { status: 500 });
  }
}
