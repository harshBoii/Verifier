import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getVerificationHtml } from '@/app/lib/email-template'; // Corrected path
import prisma from '@/app/lib/prisma'; // 1. Import your Prisma client

export async function POST(request) {
  try {
    // 2. The API now expects the verifier's email and the employee's ID
    const { verifierEmail, employeeId,company,name,position } = await request.json();
    console.log(employeeId)
    console.log(verifierEmail)
    if (!verifierEmail || !employeeId) {
      return NextResponse.json({ error: 'Missing verifierEmail or employeeId' }, { status: 401 });
    }

    // 3. Use Prisma to fetch the employee's details from the database
    // const employee = await prisma.user.findUnique({
    //   where: {
    //     id: parseInt(employeeId, 10),
    //   },
    // });

    // if (!employee) {
    //   return NextResponse.json({ error: `Employee with ID ${employeeId} not found.` }, { status: 404 });
    // }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // Corrected variable name
      },
    });

    // 4. Use the fetched data to generate the email content
    const emailHtml = getVerificationHtml(employeeId,company,name,position);

    const mailOptions = {
      from: `"Demo CRM" <${process.env.SMTP_USER}>`,
      to: verifierEmail,
      subject: `Employee Verification Request for ${name}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error("Failed to send email. Error:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}