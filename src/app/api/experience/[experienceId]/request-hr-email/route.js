import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { sendMailWithCompanySmtp } from '@/app/lib/mailer';
import { getRequestHrEmailHtml } from '@/app/lib/email-template';

export async function POST(request, { params }) {
  try {
    const { experienceId } = params;
    const numericId = parseInt(experienceId, 10);

    const experience = await prisma.workExperience.findUnique({
      where: { id: numericId },
      include: { user: true },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    const { user } = experience;
    const submissionLink = `https://verifier-phi.vercel.app/submit-hr-email/exp/${experience.id}`;

    await sendMailWithCompanySmtp({
      companyId: user.companyId,
      to: user.email,
      subject: `Action Required: Submit HR Email for your experience at ${experience.companyName}`,
      html: getRequestHrEmailHtml({
        employeeName: user.fullName,
        submissionLink: submissionLink,
      }),
    });

    return NextResponse.json({ message: 'Request email sent successfully!' });
  } catch (error) {
    console.error("API Request HR Email Error:", error);
    return NextResponse.json({ error: 'Failed to send request email.' }, { status: 500 });
  }
}
