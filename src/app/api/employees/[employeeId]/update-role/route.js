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

      // 2. If making this user an admin, handle the switch
      if (makeAdmin) {
        // Find the current admin of the company, if one exists
        const currentAdmin = await tx.user.findFirst({
          where: { companyId: companyId, role: 'ADMIN' },
        });

        // If there's a current admin who is not this employee, demote them
        if (currentAdmin && currentAdmin.id !== numericId) {
          await tx.user.update({
            where: { id: currentAdmin.id },
            data: { role: 'EMPLOYEE' },
          });
        }

        // Update the company's adminId to this employee
        await tx.company.update({
          where: { id: companyId },
          data: { adminId: numericId },
        });
      }

      // 3. Update the target employee's position and role
      const userToUpdate = await tx.user.update({
        where: { id: numericId },
        data: {
          position: position,
          // If makeAdmin is true, promote them; otherwise, ensure they are an employee
          role: makeAdmin ? 'ADMIN' : 'EMPLOYEE',
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
