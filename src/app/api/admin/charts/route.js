// api/admin/charts/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = parseInt(searchParams.get("companyId"));

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
    }

    // 1. Active Employees
    const activeEmployees = await prisma.user.count({
      where: { companyId },
    });

    // 2. Work Experiences by Progress
    const workExperienceByProgress = await prisma.workExperience.groupBy({
      by: ["progress"],
      where: { user: { companyId } },
      _count: { _all: true },
    });

    // 3. Employee Growth Over Time (last 6 months)
    const employeeGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      where: { companyId },
      _count: { _all: true },
    });

    // Format employee growth into month-year buckets
    const employeeGrowthFormatted = employeeGrowth.reduce((acc, e) => {
      const month = new Date(e.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + e._count._all;
      return acc;
    }, {});
    const employeeGrowthData = {
      labels: Object.keys(employeeGrowthFormatted),
      data: Object.values(employeeGrowthFormatted),
    };

    // 4. Top Skills
    const topSkills = await prisma.skill.findMany({
      take: 5,
      orderBy: { endorsements: "desc" },
    });

    console.log("Top Skills Are : " , topSkills)

    // 5. Campaigns by Status
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ["status"],
      where: { companyId },
      _count: { _all: true },
    });

    // 6. Verification Health
    const verificationHealth = {
      verified: await prisma.user.count({
        where: { companyId, is_verified: true },
      }),
      unverified: await prisma.user.count({
        where: { companyId, is_verified: false },
      }),
    };

    return NextResponse.json({
      activeEmployees,
      workExperienceByProgress,
      employeeGrowth: employeeGrowthData,
      topSkills,
      campaignsByStatus,
      verificationHealth,
    });
  } catch (err) {
    console.error("Company Dashboard API error:", err);
    return NextResponse.json(
      { error: "Failed to load company dashboard data" },
      { status: 500 }
    );
  }
}
