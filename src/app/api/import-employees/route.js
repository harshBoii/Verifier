import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import Papa from 'papaparse';

export async function POST(request) {
  try {
    // 1. Authenticate the admin from their session token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const adminId = payload.userId;

    // --- THIS IS THE FIX ---
    // 2. Use the adminId to fetch the admin's user record and find their companyId
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { companyId: true, role: true } // Select only what's needed
    });

    // Check if the user is an admin and is associated with a company
    if (!admin || admin.role !== 'ADMIN' || !admin.companyId) {
      return NextResponse.json({ error: 'Access denied or admin is not associated with a company.' }, { status: 403 });
    }
    const adminCompanyId = admin.companyId;
    // --- END OF FIX ---

    // 3. Parse the multipart form data to get the file and campaign name
    const formData = await request.formData();
    const file = formData.get('file');
    const campaignName = formData.get('campaignName');

    if (!file || !campaignName) {
      return NextResponse.json({ error: 'Campaign name and CSV file are required.' }, { status: 400 });
    }

    // 4. Read and parse the CSV file content
    const fileText = await file.text();
    const parsedCsv = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
    });

    const employeesToCreate = parsedCsv.data;

    // 5. Use a Prisma transaction to ensure all operations succeed or none do
    const result = await prisma.$transaction(async (tx) => {
      // 5.1. Create the new campaign linked to the admin's company
      const newCampaign = await tx.campaign.create({
        data: {
          name: campaignName,
          companyId: adminCompanyId,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      // 5.2. Prepare the new user data
      const newUsersData = await Promise.all(
        employeesToCreate.map(async (emp) => {
          if (!emp.email || !emp.password || !emp.fullName) {
            throw new Error('CSV must have "email", "password", and "fullName" columns.');
          }
          const hashedPassword = await bcrypt.hash(emp.password, 10);
          return {
            fullName: emp.fullName,
            username: emp.email.split('@')[0] + Math.floor(Math.random() * 1000),
            email: emp.email,
            password: hashedPassword,
            role: 'EMPLOYEE',
            companyId: adminCompanyId,
            position: emp.position || 'Employee',
            is_verified: false,
          };
        })
      );

      // 5.3. Create all the new users
      await tx.user.createMany({
        data: newUsersData,
        skipDuplicates: true,
      });

      // 5.4. Find the users we just created to get their IDs
      const createdUserEmails = newUsersData.map(u => u.email);
      const createdUsers = await tx.user.findMany({
        where: {
          email: { in: createdUserEmails },
        },
      });

      // 5.5. Create the link between the new users and the new campaign
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
