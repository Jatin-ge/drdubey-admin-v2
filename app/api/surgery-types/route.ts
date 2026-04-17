import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const surgeryTypes = await db.surgeryTypes.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(
      surgeryTypes.map((surgeryType: { name: any; }) => surgeryType.name)
    );
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { surgeryTypeName } = await req.json();

    // Check if surgery type already exists (case-insensitive)
    const existingSurgeryType = await db.surgeryTypes.findFirst({
      where: {
        name: {
          equals: surgeryTypeName,
          mode: "insensitive",
        },
      },
    });

    if (existingSurgeryType) {
      return new NextResponse(
        JSON.stringify({
          exists: true,
          message: `"${surgeryTypeName}" already exists in the database`,
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    await db.surgeryTypes.create({
      data: {
        name: surgeryTypeName,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${surgeryTypeName}" added successfully`,
    });
  } catch (error) {
    console.error("[SURGERY_TYPES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { oldName, newName } = await req.json();

    // Check if new name already exists
    const existingSurgeryType = await db.surgeryTypes.findFirst({
      where: {
        name: {
          equals: newName,
          mode: "insensitive",
        },
      },
    });

    if (
      existingSurgeryType &&
      existingSurgeryType.name.toLowerCase() !== oldName.toLowerCase()
    ) {
      return new NextResponse("Surgery type already exists", { status: 400 });
    }

    await db.surgeryTypes.update({
      where: { name: oldName },
      data: { name: newName },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SURGERY_TYPES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return new NextResponse("Surgery type name is required", { status: 400 });
    }

    await db.surgeryTypes.delete({
      where: { name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SURGERY_TYPES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
