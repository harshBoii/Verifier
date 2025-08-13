import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

/**
 * Handles GET requests to fetch all roles and their permissions from the database.
 */
export async function GET() {
  try {
    const permissionsFromDb = await prisma.rolePermission.findMany({
      orderBy: { id: 'asc' }
    });

    // Transform the database data into the structure your frontend expects, including all fields.
    const roles = permissionsFromDb.map(p => ({
        name: p.roleName,
        permissions: {
            accessCompanies: p.accessCompanies,
            packages: p.packages,
            supportTeam: p.supportTeam,
            searchLogin: p.searchLogin,
            manageSystemSettings: p.manageSystemSettings,
            manageAgentStaff: p.manageAgentStaff,
            assignManageCompanyStaff: p.assignManageCompanyStaff,
            initiateVerifications: p.initiateVerifications,
            viewVerificationResults: p.viewVerificationResults,
            viewReportsStatistics: p.viewReportsStatistics,
        }
    }));

    return NextResponse.json(roles);
  } catch (error) {
    console.error("API Get Roles Error:", error);
    return NextResponse.json({ error: 'Failed to fetch roles.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to update permissions for all roles.
 */
export async function POST(request) {
    try {
        const updatedRoles = await request.json();

        if (!Array.isArray(updatedRoles)) {
            return NextResponse.json({ error: 'Invalid data format. Expected an array of roles.' }, { status: 400 });
        }

        const updatePromises = updatedRoles.map(role => 
            prisma.rolePermission.update({
                where: { roleName: role.name },
                // Update all permission fields based on the frontend state.
                data: {
                    accessCompanies: role.permissions.accessCompanies,
                    packages: role.permissions.packages,
                    supportTeam: role.permissions.supportTeam,
                    searchLogin: role.permissions.searchLogin,
                    manageSystemSettings: role.permissions.manageSystemSettings,
                    manageAgentStaff: role.permissions.manageAgentStaff,
                    assignManageCompanyStaff: role.permissions.assignManageCompanyStaff,
                    initiateVerifications: role.permissions.initiateVerifications,
                    viewVerificationResults: role.permissions.viewVerificationResults,
                    viewReportsStatistics: role.permissions.viewReportsStatistics,
                }
            })
        );
        
        await prisma.$transaction(updatePromises);

        return NextResponse.json({ message: 'Permissions updated successfully!' });
    } catch (error) {
        console.error("API Update Roles Error:", error);
        return NextResponse.json({ error: 'Failed to update roles.' }, { status: 500 });
    }
}
