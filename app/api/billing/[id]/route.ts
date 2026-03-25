import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = await db.billingRecord.findUnique({
      where: { id: params.id },
      include: { lead: true },
    });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const total =
      (body.surgeonFee || 0) +
      (body.hospitalCharges || 0) +
      (body.implantCost || 0) +
      (body.anaesthesiaFee || 0) +
      (body.otherCharges || 0);
    const record = await db.billingRecord.update({
      where: { id: params.id },
      data: {
        surgeonFee: body.surgeonFee,
        hospitalCharges: body.hospitalCharges,
        implantCost: body.implantCost,
        anaesthesiaFee: body.anaesthesiaFee,
        otherCharges: body.otherCharges,
        totalAmount: total,
        amountPaid: body.amountPaid,
        amountDue: total - (body.amountPaid || 0),
        paymentMode: body.paymentMode,
        tpaName: body.tpaName,
        tpaClaimNumber: body.tpaClaimNumber,
        tpaStatus: body.tpaStatus,
        insuranceAmount: body.insuranceAmount,
        notes: body.notes,
      },
    });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
