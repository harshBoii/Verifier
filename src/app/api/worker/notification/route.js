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
    console.log("payload is :" , payload)

    // 1. Fetch user details, including email for Slack
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mobile: true, fullName: true, email: true, companyId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    const messageBody = `Hi ${user.fullName}, your progress has been updated to: ${progress}`;

    // 2. Use Promise.all to send notifications concurrently for better performance
    const notificationPromises = [];

    // Add SMS promise if mobile number exists
    if (user.mobile) {
      notificationPromises.push(
        twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.mobile,
          body: messageBody,
        })
      );
      // Add WhatsApp promise if mobile number exists
      notificationPromises.push(
        twilioClient.messages.create({
          from: "whatsapp:" + process.env.TWILIO_WHATSAPP_NUMBER,
          to: "whatsapp:" + user.mobile,
          body: messageBody,
        })
      );
    }

    // 3. Add Slack notification promise if email exists
    if (user.email) {
      // Construct the absolute URL for the internal API call
      const slackApiUrl = new URL('/api/worker/notification/slack', process.env.NEXT_PUBLIC_APP_URL).toString();
      
      notificationPromises.push(
        fetch(slackApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            message: messageBody,
          }),
        })
      );
    }
    
    // Await all notification promises
    const results = await Promise.allSettled(notificationPromises);

    // Log the outcome of all promises
    results.forEach(result => {
        if (result.status === 'rejected') {
            console.error('A notification failed to send:', result.reason);
        }
    });

    // 4. Decrement the verification count only ONCE after sending notifications
    await prisma.subscription.update({
      where: { companyId: user.companyId },
      data: {
        verifications_left: {
          decrement: 1,
        },
      },
    });

    console.log(`Finished sending notifications for expId=${expId} with credentials ${user.mobile} and ${user.companyId}`);
    console.log(`notifications are ${notificationPromises}`)
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Failed to process QStash notification:", err);
    // Add more specific error logging if possible
    if (err.code === 'P2025') { // Example for Prisma "not found" error
        return NextResponse.json({ error: "Record to update not found (e.g., subscription)." }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// // pages/api/worker/notification/route.js
// import { NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";
// import twilio from "twilio";

// export async function POST(req) {
//   try {
//     const payload = await req.json();

//     if (payload.type !== "progressUpdate") {
//       return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
//     }

//     const { userId, expId, progress } = payload;

//     // Fetch user phone number
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { mobile: true, fullName: true,companyId:true },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

//     const messageBody = `Hi ${user.fullName}, your progress has been updated to: ${progress}`;

//     // Send SMS
//     await twilioClient.messages.create({
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: user.mobile,
//       body: messageBody,
//     });

//     await prisma.subscription.update({
//       where:{id:user.companyId},
//       data:{verifications_left:{
//         decrement:1
//       }}
//     })

//     // Send WhatsApp
//     await twilioClient.messages.create({
//       from: "whatsapp:" + process.env.TWILIO_WHATSAPP_NUMBER,
//       to: "whatsapp:" + user.mobile,
//       body: messageBody,
//     });
    
//     await prisma.subscription.update({
//       where:{id:user.companyId},
//       data:{verifications_left:{
//         decrement:1
//       }}
//     })

//     console.log(`Sent SMS & WhatsApp to ${user.mobile} for expId=${expId}`);

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Failed to process QStash notification:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }