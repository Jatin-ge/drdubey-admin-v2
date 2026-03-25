import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const followup = await db.followUp.update({
      where: { id: params.id },
      data: {
        status: body.status,
        notes: body.notes,
        completedAt: body.status === "COMPLETED" ? new Date() : null,
      },
    });
    return NextResponse.json(followup);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
