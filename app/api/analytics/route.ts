import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Total patients
    const totalPatients = await db.lead.count();

    // Patients this month
    const thisMonthPatients = await db.lead.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Patients last 90 days
    const last90DaysPatients = await db.lead.count({
      where: { createdAt: { gte: ninetyDaysAgo } },
    });

    // By status
    const ipdCount = await db.lead.count({
      where: { patientStatus: "IPD" },
    });
    const opdCount = await db.lead.count({
      where: { patientStatus: "OPD" },
    });

    // By gender
    const maleCount = await db.lead.count({
      where: { gender: "Male" },
    });
    const femaleCount = await db.lead.count({
      where: { gender: "Female" },
    });

    // Top cities
    const allLeads = await db.lead.findMany({
      select: { cities: true },
    });
    const cityMap: Record<string, number> = {};
    for (const l of allLeads) {
      const c = l.cities?.trim();
      if (c) cityMap[c] = (cityMap[c] || 0) + 1;
    }
    const topCities = Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([city, count]) => ({ city, count }));

    // Top surgeries
    const surgeryLeads = await db.lead.findMany({
      select: { surgery: true },
    });
    const surgeryMap: Record<string, number> = {};
    for (const l of surgeryLeads) {
      const s = l.surgery?.trim();
      if (s) surgeryMap[s] = (surgeryMap[s] || 0) + 1;
    }
    const topSurgeries = Object.entries(surgeryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([surgery, count]) => ({ surgery, count }));

    // Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const trendLeads = await db.lead.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });
    const monthlyTrend: Record<string, number> = {};
    for (const l of trendLeads) {
      if (!l.createdAt) continue;
      const key = `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrend[key] = (monthlyTrend[key] || 0) + 1;
    }
    const trend = Object.entries(monthlyTrend)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    // Content stats
    const [totalBlogs, totalAchievements, totalEvents, totalContacts] =
      await Promise.all([
        db.blogs.count(),
        db.achievement.count(),
        db.event.count(),
        db.contactUs.count(),
      ]);

    return NextResponse.json({
      totalPatients,
      thisMonthPatients,
      last90DaysPatients,
      ipdCount,
      opdCount,
      maleCount,
      femaleCount,
      topCities,
      topSurgeries,
      trend,
      totalBlogs,
      totalAchievements,
      totalEvents,
      totalContacts,
    });
  } catch (error) {
    console.log("[ANALYTICS]", error);
    return NextResponse.json({
      totalPatients: 0,
      thisMonthPatients: 0,
      last90DaysPatients: 0,
      ipdCount: 0,
      opdCount: 0,
      maleCount: 0,
      femaleCount: 0,
      topCities: [],
      topSurgeries: [],
      trend: [],
      totalBlogs: 0,
      totalAchievements: 0,
      totalEvents: 0,
      totalContacts: 0,
    });
  }
}
