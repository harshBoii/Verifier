import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { employeeId } = params;
    const { position, makeAdmin } = await request.json();
    const numericId = parseInt(employeeId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid Employee ID.' }, { status: 400 });
    }

    // Use a transaction to ensure all updates succeed or fail together
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Find the employee to get their companyId
      const employee = await tx.user.findUnique({ where: { id: numericId } });
      if (!employee) throw new Error('Employee not found.');
      
      const { companyId } = employee;

      // 2. Get the IDs for the ADMIN and EMPLOYEE roles
      const adminRole = await tx.role.findUnique({ where: { name: 'ADMIN' } });
      const employeeRole = await tx.role.findUnique({ where: { name: 'EMPLOYEE' } });
      if (!adminRole || !employeeRole) throw new Error('Default roles not found in database.');

      // 3. If making this user an admin, handle the switch
      if (makeAdmin) {
        // Find the current admin of the company
        const companyWithAdmin = await tx.company.findUnique({
            where: { id: companyId },
            include: { admin: { include: { roles: true } } }
        });
        const currentAdmin = companyWithAdmin?.admin;

        // If there's a current admin who is not this employee, demote them
        if (currentAdmin && currentAdmin.id !== numericId) {
          // Remove their ADMIN role
          await tx.userRole.deleteMany({
            where: { userId: currentAdmin.id, roleId: adminRole.id, companyId: companyId }
          });
          // Add the EMPLOYEE role
          await tx.userRole.create({
            data: { userId: currentAdmin.id, roleId: employeeRole.id, companyId: companyId }
          });
        }

        // Update the company's adminId to this employee
        await tx.company.update({
          where: { id: companyId },
          data: { adminId: numericId },
        });
      }

      // 4. Update the target employee's position and role
      // First, remove their existing roles for this company
      await tx.userRole.deleteMany({
          where: { userId: numericId, companyId: companyId }
      });
      
      // Then, create the new role assignment
      await tx.userRole.create({
          data: {
              userId: numericId,
              roleId: makeAdmin ? adminRole.id : employeeRole.id,
              companyId: companyId
          }
      });
      
      // Finally, update the position on the user model
      const userToUpdate = await tx.user.update({
        where: { id: numericId },
        data: {
          position: position,
        },
      });
      
      return userToUpdate;
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("API Update Employee Role Error:", error);
    return NextResponse.json({ error: 'Failed to update employee.' }, { status: 500 });
  }
}
