import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cities = await db.cities.findMany({
      select: {
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(cities.map(city => city.name));
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { cityName } = await req.json();
    
    // Check if city already exists (case-insensitive)
    const existingCity = await db.cities.findFirst({
      where: {
        name: {
          equals: cityName,
          mode: 'insensitive'
        }
      }
    });

    if (existingCity) {
      return new NextResponse(
        JSON.stringify({
          exists: true,
          message: `"${cityName}" already exists in the database`
        }), 
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await db.cities.create({
      data: {
        name: cityName
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `"${cityName}" added successfully`
    });
  } catch (error) {
    console.log("Error saving city:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { oldName, newName } = await req.json();
    
    // Check if new name already exists
    const existingCity = await db.cities.findFirst({
      where: {
        name: {
          equals: newName,
          mode: 'insensitive'
        }
      }
    });

    if (existingCity && existingCity.name.toLowerCase() !== oldName.toLowerCase()) {
      return new NextResponse("City already exists", { status: 400 });
    }

    await db.cities.update({
      where: { name: oldName },
      data: { name: newName }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error updating city:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
      return new NextResponse("City name is required", { status: 400 });
    }

    await db.cities.delete({
      where: { name }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Error deleting city:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 