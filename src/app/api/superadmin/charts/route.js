import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // 1. Active Companies
    const activeCompanies = await prisma.company.count();

    // 2. Verification Volume Over Time
    const verificationsOverTime = await prisma.verificationLog.groupBy({
      by: ["verificationType"],
      _count: { _all: true },
    });

    // 3. Verification Success Rate
    const verificationSuccess = await prisma.verificationLog.groupBy({
      by: ["outcome"],
      _count: { _all: true },
    });

    // 4. Top Skills Across All Companies
    const topSkills = await prisma.skill.findMany({
      take: 10,
      orderBy: { endorsements: "desc" },
    });

    // 5. Campaigns by Status (system-wide)
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    // 6. System-wide Notifications by Type
    const notificationsByType = await prisma.notification.groupBy({
      by: ["type"],
      _count: { _all: true },
    });

    return NextResponse.json({
      activeCompanies,
      verificationsOverTime,
      verificationSuccess,
      topSkills,
      campaignsByStatus,
      notificationsByType,
    });
  } catch (err) {
    console.error("Superadmin Dashboard API error:", err);
    return NextResponse.json(
      { error: "Failed to load superadmin dashboard data" },
      { status: 500 }
    );
  }
}
