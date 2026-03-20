import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { InitialProfile } from "@/lib/initial-profile";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const profile = await currentProfile();

    const { values, date, time, userId, city } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const booking = await db.appointment.create({
      data: {
        userId,
        name: values.name,
        phone: values.phone,
        age: values.age,
        address: values.address,
        gender: values.gender,
        cityname: city,
        date,
        time,
        email: values.email,
        description: values.description,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.log("[BOOKING_CRETATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
