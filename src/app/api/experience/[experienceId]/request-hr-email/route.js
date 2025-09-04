import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendMailWithCompanySmtp } from '@/app/lib/mailer';
import { getRequestHrEmailHtml } from '@/app/lib/email-template';

export async function POST(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid Experience ID format.' }, { status: 400 });
    }

    const experience = await prisma.workExperience.findUnique({
      where: { id: numericId },
      include: { user: true },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    const { user } = experience;
    const submissionLink = `https://verifier-phi.vercel.app/submit-hr-email/exp/${experience.id}`;

    // Use Promise.all to send the email and update the database concurrently
    await Promise.all([
      sendMailWithCompanySmtp({
        companyId: user.companyId,
        to: user.email,
        subject: `Action Required: Submit HR Email for your experience at ${experience.companyName}`,
        html: getRequestHrEmailHtml({
          employeeName: user.fullName,
          submissionLink: submissionLink,
        }),
      }),
    ]);

    // --- Publish job to QStash for SMS/WhatsApp notification ---
    try {
      const payload = {
        type: "progressUpdate",
        userId: user.id,
        expId: experience.id,
        progress: `Awaiting Verifier Email , Please Provide The Hr's Email at the below given link https://verifier-phi.vercel.app/submit-hr-email/exp/${experience.id}`
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

      console.log(`Published 'Awaiting_HR_Email' notification job for experienceId=${experience.id}`);
    } catch (err) {
      // Log the error but don't fail the entire request.
      // The email was sent, which is the primary function.
      console.error("Failed to publish notification to QStash:", err);
    }

    return NextResponse.json({ message: 'Request email sent and notification queued successfully!' });

  } catch (error) {
    console.error("API Request HR Email Error:", error);
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Record to update not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to send request email.' }, { status: 500 });
  }
}
