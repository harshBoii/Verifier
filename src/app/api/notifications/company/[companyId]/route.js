import prisma from "@/app/lib/prisma";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req, context) {
  try {
    const { companyId } = await context.params;
    const body = await req.json();

    const notification = await prisma.notification.create({
      data: {
        recipientId: body.recipientId,
        actorId: body.actorId,
        workExperienceId: body.workExperienceId,
        type: body.type,
        title: body.title,
        message: body.message,
        companyId: Number(companyId),
      },
    });

    // publish to Redis channel for real-time updates
    await redis.publish(
      `company-notifications-${companyId}`,
      JSON.stringify(notification)
    );

    return new Response(JSON.stringify(notification), { status: 201 });
  } catch (err) {
    console.error("Notification POST error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create notification" }),
      { status: 500 }
    );
  }
}
export async function GET(req, context) {
  try {
    const { companyId } = await context.params;

    const notifications = await prisma.notification.findMany({
      where: { companyId: Number(companyId) },
      orderBy: { createdAt: "desc" },
      take: 50, // limit to latest 50
    });

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (err) {
    console.error("Notification GET error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      { status: 500 }
    );
  }
}
