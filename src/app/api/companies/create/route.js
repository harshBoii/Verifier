import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { companyName, adminFullName, adminEmail, adminPassword, adminPosition } = await request.json();

    if (!companyName || !adminFullName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Use a transaction to ensure all related records are created successfully
    const newCompany = await prisma.$transaction(async (tx) => {
      
      // 1. Find the ID for the 'ADMIN' role from the Role table.
      const adminRole = await tx.role.findUnique({
        where: { name: 'ADMIN' },
      });

      if (!adminRole) {
        // This is a critical error if the roles haven't been seeded.
        throw new Error("The 'ADMIN' role does not exist in the database.");
      }

      // 2. Create the company first.
      const company = await tx.company.create({
        data: { name: companyName },
      });

      // 3. Create the Admin User for this company.
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = await tx.user.create({
        data: {
          username: adminEmail.split('@')[0],
          fullName: adminFullName,
          email: adminEmail,
          password: hashedPassword,
          position: adminPosition,
          companyId: company.id, // Link the user to the company
          // Create the role assignment in the UserRole join table
          roles: {
            create: {
              roleId: adminRole.id,
              companyId: company.id,
            },
          },
        },
      });

      // 4. Update the company to set its adminId to the user we just created.
      const updatedCompany = await tx.company.update({
        where: { id: company.id },
        data: { adminId: adminUser.id },
      });
      
      return updatedCompany;
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error("API Create Company Error:", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A company or user with this name/email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create company.' }, { status: 500 });
  }
}
