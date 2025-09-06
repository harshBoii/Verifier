import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { Receiver } from '@upstash/qstash';

// Initialize the Receiver
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  try {
    // 1. Verify the request is from QStash
    const signature = request.headers.get("upstash-signature");
    const body = await request.text();

    const isValid = await receiver.verify({
      signature,
      body,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/notifications/whatsapp`,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
    }

    // 2. Parse the payload for the verifier's number and message
    const {companyId,verifierNumber, message } = JSON.parse(body);

    if (!verifierNumber || !message) {
      return NextResponse.json({ error: 'Missing verifierNumber or message' }, { status: 400 });
    }

    // 3. Directly send the WhatsApp message using the provided data
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${verifierNumber}`,
      body: message,
    });

    await prisma.subscription.update({
      where:{id:companyId},
      data:{verifications_left:{
        decrement:1
      }}
    })

    console.log(`Sent WhatsApp message to ${verifierNumber}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Failed to process WhatsApp notification:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
