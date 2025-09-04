import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getVerificationHtml } from '@/app/lib/email-template';
import { sendMailWithCompanySmtp } from '@/app/lib/mailer'; // 1. Import the new mailer helper
import { Prisma } from '../../../../generated/prisma';

export async function POST(request) {
  try {
    // The API still accepts all the original arguments
    const { verifierEmail, employeeId, company, name, position, exp_id } = await request.json();
    console.log(verifierEmail,exp_id,employeeId)


    if (!verifierEmail || !exp_id) {
      // console.log(verifierEmail,exp_id,employeeId)
      return NextResponse.json({ error: 'Missing verifierEmail or experience ID' }, { status: 400 });
    }

    // 2. Find the work experience to get the user and their companyId
    const experience = await prisma.workExperience.findUnique({
      where: { id: parseInt(exp_id, 10) },
      include: { user: true },
    });

    if (!experience) {
      throw new Error('Work experience not found.');
    }

    const { user } = experience;

    // 3. Call the mailer helper with the required details
    // It will automatically handle fetching and using the company's SMTP settings
    await sendMailWithCompanySmtp({
        companyId: user.companyId,
        to: verifierEmail,
        subject: `Employee Verification Request for ${user.fullName}`,
        html: getVerificationHtml(employeeId, company, name, position, exp_id),
    });

    // 4. Update the database to record that the email was sent
    const updatedExperience=await prisma.workExperience.update({
        where: { id: parseInt(exp_id, 10) },
        data: { 
            verifier_email: verifierEmail,
            mail_sent: true, 
            progress:'Mail_sent'
        },
    });

try {
  const payload = {
    type: "progressUpdate",
    expId: updatedExperience.id, // Corrected from 'experienceId'
    userId: updatedExperience.userId,
    progress: `Mail Sent for ${updatedExperience.companyName}`,
  };

  // The destination URL from your environment variables
  const deliveryUrl = process.env.QSTASH_DELIVERY_URL;

  // CONSTRUCT THE CORRECT PUBLISH URL HERE
  const publishUrl = `https://qstash.upstash.io/v2/publish/${deliveryUrl}`;

  await fetch(publishUrl, { // Use the newly constructed URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    },
    // The body now only needs to contain the payload for your worker
    body: JSON.stringify(payload), 
  });

  console.log(`Published HR Email update for experienceId=${updatedExperience.id}`);
} catch (err) {
  console.error("Failed to publish HR Email update to QStash:", err);
}
    return NextResponse.json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error("Failed to send email. Error:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
