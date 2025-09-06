import { NextResponse } from 'next/server';
import { sendMailWithCompanySmtp } from '@/app/lib/mailer'; // Your custom mailer helper
import { Receiver } from '@upstash/qstash';

// Initialize the Receiver for signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

export async function POST(request) {
  try {
    // 1. Verify the request is from QStash
    const signature = request.headers.get("upstash-signature");
    const body = await request.text();

    const isValid = await receiver.verify({
      signature,
      body,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/notification/email`,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
    }

    // 2. Safely parse the payload for the details needed
    const { companyId, verifierEmail, subject, htmlContent } = JSON.parse(body);

    if (!companyId || !verifierEmail || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required payload parameters' }, { status: 400 });
    }

    // 3. Directly call the mailer utility with the provided data
    await sendMailWithCompanySmtp({
        companyId: companyId,
        to: verifierEmail,
        subject: subject,
        html: htmlContent,
    });

    await prisma.subscription.update({
      where:{id:companyId},
      data:{verifications_left:{
        decrement:1
      }}
    })

    console.log(`Email sent successfully to ${verifierEmail}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Failed to process email notification:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
