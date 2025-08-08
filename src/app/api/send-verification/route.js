import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getVerificationHtml } from '@/app/lib/email-template'; // Corrected path


export async function POST(request) {
  try {
    // 2. The API now expects the verifier's email and the employee's ID
    const { verifierEmail, employeeId,company,name,position,exp_id } = await request.json();
    console.log(employeeId)
    console.log(verifierEmail)
    if (!verifierEmail || !employeeId) {
      return NextResponse.json({ error: 'Missing verifierEmail or employeeId' }, { status: 401 });
    }

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
    const emailHtml = getVerificationHtml(employeeId,company,name,position,exp_id);

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