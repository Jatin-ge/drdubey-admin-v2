import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Achievement ID missing", { status: 400 });
    }

    const achievement = await db.achievement.findUnique({
      where: { id: params.id },
    });

    if (!achievement) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.log("[ACHIEVEMENT_GET_ONE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Achievement ID missing", { status: 400 });
    }

    const values = await req.json();

    const achievement = await db.achievement.update({
      where: { id: params.id },
      data: values,
    });

    return NextResponse.json(achievement);
  } catch (error) {
    console.log("[ACHIEVEMENT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Achievement ID missing", { status: 400 });
    }

    const achievement = await db.achievement.delete({
      where: { id: params.id },
    });

    return NextResponse.json(achievement);
  } catch (error) {
    console.log("[ACHIEVEMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
