import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    const startDate = new Date(parseInt(year!), parseInt(month!) - 1, 1);
    const endDate = new Date(parseInt(year!), parseInt(month!), 0, 23, 59, 59);

    const appointments = await db.appointment.findMany({
      orderBy: { createdAt: "desc" },
    });

    const closedDays = await db.closedDay.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });

    return NextResponse.json({ appointments, closedDays });
  } catch (error) {
    return NextResponse.json({ appointments: [], closedDays: [] });
  }
}
