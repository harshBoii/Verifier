import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getRequestHrEmailHtml } from '@/app/lib/email-template';
import { sendMailWithCompanySmtp } from '@/app/lib/mailer';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericUserId)) {
      return NextResponse.json({ error: 'Invalid User ID format.' }, { status: 400 });
    }

    // 1. Find the user in the database to get their details
    const user = await prisma.user.findUnique({
      where: {
        id: numericUserId,
      }
    });

    if (!user) {
      return NextResponse.json({ error: `User with ID ${userId} not found.` }, { status: 404 });
    }

    // 2. Send the email requesting the HR manager's contact
    const submissionLink = `https://verifier-phi.vercel.app/submit-hr-email/user/${userId}`;
    
    await sendMailWithCompanySmtp({
      companyId: user.companyId,
      to: user.email,
      subject: 'Action Required: Submit Your HR Manager\'s Email',
      html: getRequestHrEmailHtml({ employeeName: user.fullName, submissionLink }),
    });

    // 3. Publish a job to QStash to trigger the SMS/WhatsApp worker
    try {
      const payload = {
        type: "progressUpdate",
        userId: user.id,
        // Since there's no specific experience, we can set a custom progress message
        progress: 'HR_Email_Requested', 
        // We set expId to null as it's not relevant to this specific action
        expId: null, 
      };

      const deliveryUrl = process.env.QSTASH_DELIVERY_URL;
      const publishUrl = `https://qstash.upstash.io/v2/publish/${deliveryUrl}`;

      await fetch(publishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      console.log(`Published 'HR_Email_Requested' notification for userId=${user.id}`);
    } catch (err) {
      // Log the QStash error but don't fail the overall API call
      console.error("Failed to publish notification to QStash:", err);
    }

    return NextResponse.json({ message: 'Request email sent and notification queued successfully!' });

  } catch (error) {
    console.error("Failed to send request email. Error:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
