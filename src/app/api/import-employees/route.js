import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import Papa from 'papaparse';

export async function POST(request) {
  try {
    // 1. Authenticate the admin and get their company ID
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const adminId = payload.userId;

    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { companyId: true }
    });

    if (!admin || !admin.companyId) {
      return NextResponse.json({ error: 'Access denied or admin is not associated with a company.' }, { status: 403 });
    }
    const adminCompanyId = admin.companyId;

    // 2. Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const campaignName = formData.get('campaignName');

    if (!file || !campaignName) {
      return NextResponse.json({ error: 'Campaign name and CSV file are required.' }, { status: 400 });
    }

    // 3. Read and parse the CSV file content
    const fileText = await file.text();
    const parsedCsv = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
    });

    const employeesFromCsv = parsedCsv.data;

    // 4. Use a Prisma transaction to ensure all operations succeed or none do
    const result = await prisma.$transaction(async (tx) => {
      // 4.1. Find the ID for the 'EMPLOYEE' role.
      const employeeRole = await tx.role.findUnique({ where: { name: 'EMPLOYEE' } });
      if (!employeeRole) {
        throw new Error("Default 'EMPLOYEE' role not found. Please seed the database.");
      }

      // 4.2. Create the new campaign linked to the admin's company
      const newCampaign = await tx.campaign.create({
        data: {
          name: campaignName,
          companyId: adminCompanyId,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      // 4.3. Loop through and create each user and their role assignment.
      // We must create users one by one to create the role relation simultaneously.
      const createdUsers = [];
      for (const emp of employeesFromCsv) {
        if (!emp.email || !emp.password || !emp.fullName) {
          throw new Error('CSV must have "email", "password", and "fullName" columns.');
        }
        const hashedPassword = await bcrypt.hash(emp.password, 10);
        
        const newUser = await tx.user.create({
          data: {
            fullName: emp.fullName,
            username: emp.email.split('@')[0] + Math.floor(Math.random() * 1000),
            email: emp.email,
            password: hashedPassword,
            companyId: adminCompanyId,
            position: emp.position || 'Employee',
            is_verified: false,
            // Create the role assignment in the UserRole join table
            roles: {
              create: {
                roleId: employeeRole.id,
                companyId: adminCompanyId,
              },
            },
          },
        });
        createdUsers.push(newUser);
      }

      // 4.4. Create the link between the new users and the new campaign
      const campaignUserLinks = createdUsers.map(user => ({
        userId: user.id,
        campaignId: newCampaign.id,
      }));

      await tx.campaignUser.createMany({
        data: campaignUserLinks,
      });

      return {
        campaign: newCampaign,
        usersCreated: createdUsers.length,
      };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("API Import Employees Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to import employees.' }, { status: 500 });
  }
}
