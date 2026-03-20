import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { formatISO } from "date-fns";

export async function POST(req: Request) {
  try {
    const { selectedDates, cityName } = await req.json();

    // Format the selected dates to ISO format
    const formattedDates = selectedDates.map((date: any) => formatISO(new Date(date)));

    // Get the city by name
    const city = await db.cities.findUnique({
      where: {
        name: cityName,
      },
    });

    if (!city) {
      return new NextResponse("City not found", { status: 404 });
    }

    // Create closed days in the database associated with the specified city
    const closedDays = await Promise.all(
      formattedDates.map(async (date: any) => {
        const closedDay = await db.closedDay.create({
          data: {
            date: new Date(date),
            city: { connect: { name: city.name } }, // Connect the closed day with the city
          },
        });
        return closedDay;
      })
    );

    return NextResponse.json(closedDays);
  } catch (err) {
    console.error("CLOSED_DAYS_CREATE", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
