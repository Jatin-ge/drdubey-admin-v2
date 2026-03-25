import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const where: any = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (status === "overdue") {
      where.dueDate = { lte: new Date() };
      where.status = "PENDING";
    } else if (status === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      where.dueDate = { gte: start, lte: today };
      where.status = "PENDING";
    } else if (status === "upcoming") {
      where.dueDate = { gte: new Date() };
      where.status = "PENDING";
    }

    const followups = await db.followUp.findMany({
      where,
      include: { lead: true },
      orderBy: { dueDate: "asc" },
      take: 100,
    });
    return NextResponse.json(followups);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const followup = await db.followUp.create({
      data: {
        leadId: body.leadId,
        dueDate: new Date(body.dueDate),
        type: body.type,
        notes: body.notes || "",
        status: "PENDING",
      },
    });
    return NextResponse.json(followup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
