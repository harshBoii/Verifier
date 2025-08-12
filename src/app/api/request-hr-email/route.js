import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getRequestHrEmailHtml } from '@/app/lib/email-template';
import { sendMailWithCompanySmtp } from '@/app/lib/mailer'; // 1. Import the new mailer helper

export async function POST(request) {
  try {
    const { userId } = await request.json();

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

    // 3. Create the unique submission link for the email
    const submissionLink = `https://verifier-phi.vercel.app/submit-hr-email/user/${userId}`;

    // 4. Call the mailer helper with the required details
    // It will automatically handle fetching and using the company's SMTP settings
    await sendMailWithCompanySmtp({
        companyId: user.companyId,
        to: user.email,
        subject: 'Action Required: Submit Your HR Manager\'s Email',
        html: getRequestHrEmailHtml({ employeeName: user.fullName, submissionLink }),
    });

    return NextResponse.json({ message: 'Request email sent successfully!' });

  } catch (error) {
    console.error("Failed to send request email. Error:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
