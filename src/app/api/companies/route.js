import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    // Fetch all companies and include the full user object for the admin
    const companies = await prisma.company.findMany({
      include: {
        admin: true, // This brings in the admin's details
      },
    });

    // Process the data to create a clean structure for the frontend
    const companiesData = companies.map(company => ({
      id: company.id,
      companyName: company.name,
      adminName: company.admin?.fullName || 'N/A', // Use optional chaining
      adminEmail: company.admin?.email || 'N/A',
      // Add mock data for package and remaining days for the demo
      package: company.name === 'Meta' || company.name === 'Sriram' ? 'Free trail' : 'Gold',
      remaining: company.name === 'Meta' ? '4 days' : '24 days',
    }));

    return NextResponse.json(companiesData);

  } catch (error) {
    console.error("API Fetch Companies Error:", error);
    return NextResponse.json({ error: 'Failed to fetch company data.' }, { status: 500 });
  }
}
