import { prisma } from "@/app/lib/prisma";

export async function POST(req) {
  const { adminId, employeeId } = await req.json();

  const sub = await prisma.notificationSubscription.create({
    data: { adminId, employeeId },
  });

  return new Response(JSON.stringify(sub), { status: 200 });
}

export async function DELETE(req) {
  const { adminId, employeeId } = await req.json();

  await prisma.notificationSubscription.delete({
    where: { adminId_employeeId: { adminId, employeeId } },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
