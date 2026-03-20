import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(achievements);
  } catch (error) {
    console.log("[ACHIEVEMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const values = await req.json();

    const slug = values.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const achievement = await db.achievement.create({
      data: {
        ...values,
        slug,
      },
    });

    return NextResponse.json(achievement);
  } catch (error) {
    console.log("[ACHIEVEMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
