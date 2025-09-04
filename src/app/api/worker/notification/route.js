// pages/api/worker/notification/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import twilio from "twilio";

export async function POST(req) {
  try {
    const payload = await req.json();

    if (payload.type !== "progressUpdate") {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const { userId, expId, progress } = payload;

    // Fetch user phone number
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mobile: true, fullName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    const messageBody = `Hi ${user.fullName}, your progress has been updated to: ${progress}`;

    // Send SMS
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.mobile,
      body: messageBody,
    });

    // Send WhatsApp
    await twilioClient.messages.create({
      from: "whatsapp:" + process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + user.mobile,
      body: messageBody,
    });

    console.log(`Sent SMS & WhatsApp to ${user.mobile} for expId=${expId}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to process QStash notification:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
