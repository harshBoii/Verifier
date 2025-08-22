import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import Papa from 'papaparse';

export async function POST(request) {
  try {
    // 1. Authenticate the admin (Your existing code is good)
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

    // 2. Parse form data (Your existing code is good)
    const formData = await request.formData();
    const file = formData.get('file');
    const campaignName = formData.get('campaignName');
    const mappingString = formData.get('mapping');

    if (!file || !campaignName || !mappingString) {
      return NextResponse.json({ error: 'Campaign name, file, and column mapping are required.' }, { status: 400 });
    }

    const mapping = JSON.parse(mappingString);
    const fileText = await file.text();
    const parsedCsv = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
    });
    const employeesFromCsv = parsedCsv.data;

    // --- THIS IS THE FIX ---
    // Use a Prisma transaction with increased timeouts for long-running imports.
    const result = await prisma.$transaction(async (tx) => {
      // 4.1. Find the ID for the 'EMPLOYEE' role
      const employeeRole = await tx.role.findUnique({ where: { name: 'EMPLOYEE' } });
      if (!employeeRole) {
        throw new Error("Default 'EMPLOYEE' role not found. Please seed the database.");
      }

      // 4.2. Create the new campaign
      const newCampaign = await tx.campaign.create({
        data: {
          name: campaignName,
          companyId: adminCompanyId,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        },
      });

      // 4.3. Loop through employees (Your existing loop is good)
      const createdUsers = [];
      for (const emp of employeesFromCsv) {
        const fullName = emp[mapping.fullName];
        const email = emp[mapping.email];
        const password = emp[mapping.password];
        const position = emp[mapping.position] || 'Employee';

        if (!fullName || !email || !password) {
          throw new Error(`A required field was not found in a row. Please check mapping and CSV data. Row: ${JSON.stringify(emp)}`);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await tx.user.create({
          data: {
            fullName,
            email,
            password: hashedPassword,
            username: email.split('@')[0] + Math.floor(Math.random() * 1000),
            companyId: adminCompanyId,
            position,
            roles: {
              create: { roleId: employeeRole.id, companyId: adminCompanyId },
            },
          },
        });
        createdUsers.push(newUser);
      }

      // 4.4. Link the newly created users to the new campaign
      await tx.campaignUser.createMany({
        data: createdUsers.map(user => ({
            userId: user.id,
            campaignId: newCampaign.id,
        })),
      });

      return {
        campaign: newCampaign,
        usersCreated: createdUsers.length,
      };
    }, 
    // Add the timeout options object as the second argument to $transaction
    {
      maxWait: 15000, // How long Prisma Client will wait to acquire a transaction from the database connection pool (default: 2000ms)
      timeout: 30000, // How long the interactive transaction can run (default: 5000ms)
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("API Import Employees Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to import employees.' }, { status: 500 });
  }
}
