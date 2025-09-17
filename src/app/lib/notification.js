import prisma from "./prisma";
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


export async function createNotification({
  recipientId,
  actorId,
  workExperienceId,
  type,
  title,
  message,
}) {
  // Save in DB
  const notification = await prisma.notification.create({
    data: {
      recipientId,
      actorId,
      workExperienceId,
      type,
      title,
      message,
    },
  });

  // Publish real-time
  await redis.publish(`notifications-${recipientId}`, JSON.stringify(notification));

  return notification;
}
