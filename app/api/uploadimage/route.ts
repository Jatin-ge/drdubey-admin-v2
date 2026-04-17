import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
)

{  
  try{ 

    const {imageUrl, description} = await req.json()

    const image  = await db.image.create({
      data:{
        imageUrl,
        description
      }
})
      
      return NextResponse.json(image);
  } catch (error) {
    console.error("[IMAGE_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
