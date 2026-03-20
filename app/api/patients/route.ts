import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { differenceInYears } from "date-fns";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      gender,
      address,
      remark,
      age,
      doad,
      dood,
      dx,
      surgery,
      side,
      ipdReg,
      bill,
      implant,
      patientStatus,
      tpa,
      cities,
      hospital,
    } = await req.json();

    // Validate and normalize phone to exactly 10 digits
    const digitsOnly = (String(phone || '').match(/\d/g) || []).join('');
    if (digitsOnly.length !== 10) {
      return new NextResponse("Invalid phone number. Must be 10 digits.", { status: 400 });
    }

    const Lead = await db.lead.create({
      data: {
        name,
        email,
        phone: digitsOnly,
        gender,
        address,
        remark,
        age,
        doad,
        dood,
        dx,
        surgery,
        side,
        ipdReg,
        bill,
        implant,
        patientStatus,
        tpa,
        cities,
        hospital,
      },
    });

    return NextResponse.json(Lead);
  } catch (err) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
