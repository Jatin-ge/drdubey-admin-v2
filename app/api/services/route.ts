import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const services = await db.services.findMany();
    return NextResponse.json(services);
  } catch (error) {
    console.log("[SERVICES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const values = await req.json();
    const slug =
      values.slug ||
      values.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const service = await db.services.create({
      data: { ...values, slug },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.log("[SERVICE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
