import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data: any = { status: body.status };
    if (body.status === "CALLED") data.calledAt = new Date();
    if (body.status === "COMPLETED") data.completedAt = new Date();

    const token = await db.opdToken.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(token);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
