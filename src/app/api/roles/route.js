import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// In a real app, this data would come from a dedicated 'Role' table.
// For this demo, we'll use a mock structure.
const mockPermissions = {
    'Brand Admin': { accessCompanies: false, packages: true, supportTeam: true, searchLogin: true },
    'Brand owner': { accessCompanies: true, packages: true, supportTeam: true, searchLogin: false },
    'Manager': { accessCompanies: true, packages: true, supportTeam: false, searchLogin: false },
    'Employee 1': { accessCompanies: true, packages: false, supportTeam: true, searchLogin: false },
    'Employee 2': { accessCompanies: false, packages: true, supportTeam: true, searchLogin: false },
    'Intern': { accessCompanies: true, packages: false, supportTeam: true, searchLogin: false },
};

export async function GET() {
  try {
    // In a real app, you would query your database for roles and permissions.
    // For now, we return the mock data.
    const roles = Object.keys(mockPermissions).map(name => ({
        name,
        permissions: mockPermissions[name]
    }));
    return NextResponse.json(roles);
  } catch (error) {
    console.error("API Get Roles Error:", error);
    return NextResponse.json({ error: 'Failed to fetch roles.' }, { status: 500 });
  }
}

export async function POST(request) {
    try {
        const updatedRoles = await request.json();
        // In a real app, you would loop through updatedRoles and update each
        // role in your database with its new permissions.
        console.log("Received updated roles:", updatedRoles);
        // We'll just log it for the demo.
        return NextResponse.json({ message: 'Permissions updated successfully!' });
    } catch (error) {
        console.error("API Update Roles Error:", error);
        return NextResponse.json({ error: 'Failed to update roles.' }, { status: 500 });
    }
}
