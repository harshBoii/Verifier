import prisma from "@/app/lib/prisma";

export async function GET(req, { params }) {
  const { userId } = params;

  const notifications = await prisma.notification.findMany({
    where: { recipientId: Number(userId) },
    orderBy: { createdAt: "desc" },
  });

  return new Response(JSON.stringify(notifications), { status: 200 });
}
