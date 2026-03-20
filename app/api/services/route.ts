import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
)

{  
  try{ 
    const values = await req.json();
    console.log("values", values)

    const service  = await db.services.create({
      data: values
})
      
      return NextResponse.json(service);
  } catch (error) {
    console.log("[SERVICE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
