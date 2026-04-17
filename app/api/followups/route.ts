import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZodError } from "zod";
import { FollowUpSchema } from "@/lib/validations";

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
    const raw = await req.json();
    const body = FollowUpSchema.parse(raw);
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[FOLLOWUPS_POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
