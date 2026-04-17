import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doctors = await db.referralDoctor.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true } } },
    });
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("[REFERRAL_DOCTORS_GET]", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doctor = await db.referralDoctor.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        specialty: body.specialty || null,
        hospital: body.hospital || null,
        city: body.city || null,
        email: body.email || null,
        notes: body.notes || null,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(doctor);
  } catch (error: any) {
    console.error("[REFERRAL_DOCTORS_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create" },
      { status: 500 }
    );
  }
}
