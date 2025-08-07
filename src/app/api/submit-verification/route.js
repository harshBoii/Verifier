import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getVerificationResultHtml } from '@/app/lib/email-template'; // Corrected path
import prisma from '@/app/lib/prisma'; // 1. Import your Prisma client

export async function POST(request) {
  try {
    // 2. The API now only needs the employee's ID and the comment
    const { employeeId, revisionComment } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
    }

    // 3. Use Prisma to fetch the employee and their company's admin details
    const employee = await prisma.user.findUnique({
      where: {
        id: parseInt(employeeId, 10),
      },
      include: {
        // Include the company relation to find the admin
        company: {
          include: {
            admin: true, // Include the full admin user object
          },
        },
      },
    });

    if (!employee || !employee.company || !employee.company.admin) {
      return NextResponse.json({ error: 'Could not find employee or their company admin.' }, { status: 404 });
    }

    const adminEmail = employee.company.admin.email;
    const employeeName = employee.fullName;
    const employeeEmail = employee.email;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // Corrected variable name
      },
    });

    // 4. Generate the email HTML using the fetched data
    const emailHtml = getVerificationResultHtml({
      employeeName: employeeName,
      verifierComment: revisionComment
    });

    // --- Email to Admin ---
    const adminMailOptions = {
      from: `"Demo CRM" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Verification Submitted for ${employeeName}`,
      html: emailHtml,
    };

    // --- Email to Employee ---
    const employeeMailOptions = {
      from: `"Demo CRM" <${process.env.SMTP_USER}>`,
      to: employeeEmail,
      subject: `Your Verification Has Been Processed`,
      html: emailHtml,
    };
    
    // 5. Update the employee's status to verified in the database
    const updateEmployeeStatus = prisma.user.update({
        where: { id: employee.id },
        data: { is_verified: true },
    });

    // 6. Send both emails and update the database concurrently
    await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(employeeMailOptions),
        updateEmployeeStatus
    ]);

    return NextResponse.json({ message: 'Verification submitted and emails sent successfully!' });

  } catch (error) {
    console.error("Failed to send verification result. Error:", error);
    return NextResponse.json({ error: 'Failed to submit verification.' }, { status: 500 });
  }
}
