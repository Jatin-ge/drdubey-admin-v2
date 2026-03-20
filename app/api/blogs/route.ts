import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
)

{  
  try{ 
    const values = await req.json();
    console.log("values", values)

    const blog  = await db.blogs.create({
      data: values
})
      
      return NextResponse.json(blog);
  } catch (error) {
    console.log("[blog_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
