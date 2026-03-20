import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const updatedDays = await req.json();

    // Assuming your Day model has an 'id' field
    for (const updatedDay of updatedDays) {
      const { id, name, dayOfWeek, openTime, closeTime } = updatedDay;

      // Update the Day in the database
      await db.day.update({
        where: { id },
        data: {
          name,
          dayOfWeek,
          openTime,
          closeTime,
        },
      });
    }

    // Fetch the updated data from the database
    const allDays = await db.day.findMany();

    // Send the updated data as the response
    return NextResponse.json(allDays);
  } catch (err) {
    console.error("DAYS_UPDATE", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
