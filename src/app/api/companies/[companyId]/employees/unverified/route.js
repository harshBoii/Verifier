import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request, { params }) {
  const { companyId } = params;

  try {
    const employees = await prisma.user.findMany({
      where: {
        companyId: { equals: Number(companyId) }, // ✅ fix here
        is_verified: false,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        is_verified: true,
        company: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("Error fetching unverified employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unverified employees" },
      { status: 500 }
    );
  }
}
