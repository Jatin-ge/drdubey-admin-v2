import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${year}${month}-${random}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");

  try {
    const where = leadId ? { leadId } : {};
    const records = await db.billingRecord.findMany({
      where,
      include: { lead: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const total =
      (body.surgeonFee || 0) +
      (body.hospitalCharges || 0) +
      (body.implantCost || 0) +
      (body.anaesthesiaFee || 0) +
      (body.otherCharges || 0);
    const amountPaid = body.amountPaid || 0;
    const record = await db.billingRecord.create({
      data: {
        leadId: body.leadId,
        invoiceNumber: generateInvoiceNumber(),
        surgeonFee: body.surgeonFee || 0,
        hospitalCharges: body.hospitalCharges || 0,
        implantCost: body.implantCost || 0,
        anaesthesiaFee: body.anaesthesiaFee || 0,
        otherCharges: body.otherCharges || 0,
        totalAmount: total,
        amountPaid,
        amountDue: total - amountPaid,
        paymentMode: body.paymentMode || "",
        tpaName: body.tpaName || "",
        tpaClaimNumber: body.tpaClaimNumber || "",
        tpaStatus: body.tpaStatus || "PENDING",
        insuranceAmount: body.insuranceAmount || 0,
        notes: body.notes || "",
        invoiceDate: new Date(),
      },
      include: { lead: true },
    });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
