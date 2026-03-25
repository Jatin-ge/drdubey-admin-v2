import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPatients,
      thisWeekPatients,
      totalBlogs,
      publishedBlogs,
      totalAchievements,
      recentContacts,
      recentPatients,
    ] = await Promise.all([
      db.lead.count(),
      db.lead.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      db.blogs.count(),
      db.blogs.count({ where: { isPublished: true } }),
      db.achievement.count(),
      db.contactUs.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          phone: true,
          cities: true,
          patientStatus: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalPatients,
      thisWeekPatients,
      totalBlogs,
      publishedBlogs,
      totalAchievements,
      recentContacts,
      recentPatients,
    });
  } catch (error) {
    console.log("[DASHBOARD_STATS]", error);
    return NextResponse.json({
      totalPatients: 0,
      thisWeekPatients: 0,
      totalBlogs: 0,
      publishedBlogs: 0,
      totalAchievements: 0,
      recentContacts: [],
      recentPatients: [],
    });
  }
}
