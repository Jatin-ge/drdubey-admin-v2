import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    const tokens = await db.opdToken.findMany({
      where: { date },
      orderBy: { tokenNumber: "asc" },
    });
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const date = body.date || new Date().toISOString().split("T")[0];

    const lastToken = await db.opdToken.findFirst({
      where: { date },
      orderBy: { tokenNumber: "desc" },
    });

    const nextNumber = (lastToken?.tokenNumber || 0) + 1;

    const token = await db.opdToken.create({
      data: {
        tokenNumber: nextNumber,
        date,
        patientName: body.patientName,
        patientPhone: body.patientPhone || "",
        leadId: body.leadId || null,
        city: body.city || "",
        status: "WAITING",
      },
    });
    return NextResponse.json(token);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
