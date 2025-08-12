import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { companyName, adminFullName, adminEmail, adminPassword, adminPosition } = await request.json();

    if (!companyName || !adminFullName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Use a transaction to ensure both company and admin are created successfully
    const newCompany = await prisma.$transaction(async (tx) => {
      // Step 1: Create the company first
      const company = await tx.company.create({
        data: { name: companyName },
      });

      // Step 2: Create the Admin User for this company
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = await tx.user.create({
        data: {
          username: adminEmail.split('@')[0], // Create a username from email
          fullName: adminFullName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          position: adminPosition,
          companyId: company.id,
        },
      });

      // Step 3: Update the company to set its admin
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
