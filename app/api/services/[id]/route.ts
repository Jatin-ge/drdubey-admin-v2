import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Service ID missing", { status: 400 });
    }
    const service = await db.services.findUnique({ where: { id: params.id } });
    if (!service) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_GET_ONE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Service ID missing", { status: 400 });
    }
    const values = await req.json();
    const service = await db.services.update({
      where: { id: params.id },
      data: values,
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Service ID missing", { status: 400 });
    }
    await db.services.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
