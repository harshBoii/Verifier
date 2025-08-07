import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getRequestHrEmailHtml } from '@/app/lib/email-template'; // Corrected path
import prisma from '@/app/lib/prisma'; // 1. Import your Prisma client

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    // Convert the incoming string ID to a number for Prisma
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
        return NextResponse.json({ error: 'Invalid User ID format.' }, { status: 400 });
    }

    // 2. Use Prisma to find the user in the database
    const user = await prisma.user.findUnique({
        where: {
            id: numericUserId,
        }
    });

    if (!user) {
      return NextResponse.json({ error: `User with ID ${userId} not found.` }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // This MUST be your 16-character App Password
      },
    });

    const submissionLink = `http://localhost:3000/submit-hr-email/${userId}`;

    const mailOptions = {
      from: `"Demo CRM" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Action Required: Submit Your HR Manager\'s Email',
      // Use fullName from the database record
      html: getRequestHrEmailHtml({ employeeName: user.fullName, submissionLink }),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Request email sent successfully!' });

  } catch (error) {
    console.error("Failed to send request email. Error:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}