import nodemailer from 'nodemailer';
import prisma from '@/app/lib/prisma';
import { getVerificationResultHtml } from '@/app/lib/email-template';

/**
 * Shared verification completion: DB updates, emails, notification, QStash.
 * Used by POST /api/submit-verification and POST /api/webhook/call/done.
 */
export async function performSubmitVerification({ employeeId, expId, revisionComment }) {
  if (!employeeId || !expId) {
    throw new Error('Missing employeeId or expId');
  }

  const employee = await prisma.user.findUnique({
    where: { id: parseInt(employeeId, 10) },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!employee || !employee.company || !employee.company.admin) {
    throw new Error('Could not find employee or their company admin.');
  }

  const { fullName: employeeName, email: employeeEmail, company } = employee;
  const { name: companyName, admin } = company;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const emailHtml = getVerificationResultHtml({
    employeeName,
    verifierComment: revisionComment,
  });

  const adminMailOptions = {
    from: `"Demo CRM" <${process.env.SMTP_USER}>`,
    to: admin.email,
    subject: `Verification Submitted for ${employeeName} by ${companyName}`,
    html: emailHtml,
  };

  const employeeMailOptions = {
    from: `"Demo CRM" <${process.env.SMTP_USER}>`,
    to: employeeEmail,
    subject: `Your Verification Has Been Processed for Experience in ${companyName}`,
    html: emailHtml,
  };

  const transaction = prisma.$transaction([
    prisma.user.update({
      where: { id: employee.id },
      data: { is_verified: true },
    }),
    prisma.workExperience.update({
      where: { id: expId },
      data: { hr_comment: revisionComment, progress: 'Summary_added', chat_finished: true },
    }),
  ]);

  await prisma.notification.create({
    data: {
      companyId: company.id,
      recipientId: company.admin.id,
      actorId: null,
      workExperienceId: expId || null,
      type: 'COMPANY_ADMIN_ONLY',
      title: 'Summary Generated',
      message: `A summary has been generated for employee ${employeeName}'s work experience with id ${employeeId}`,
    },
  });

  await Promise.all([
    transporter.sendMail(adminMailOptions),
    transporter.sendMail(employeeMailOptions),
    transaction,
  ]);

  try {
    const payload = {
      type: 'progressUpdate',
      userId: employee.id,
      expId,
      progress: 'Summary_added',
      comment: revisionComment,
    };

    const deliveryUrl = process.env.QSTASH_DELIVERY_URL;
    const publishUrl = `https://qstash.upstash.io/v2/publish/${deliveryUrl}`;

    await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`Published verificationComplete job for userId=${employee.id}`);
  } catch (err) {
    console.error('Failed to publish notification to QStash:', err);
  }

  return { message: 'Verification submitted and emails sent successfully!' };
}
