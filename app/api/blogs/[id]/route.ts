import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Blog ID missing", { status: 400 });
    }
    const blog = await db.blogs.findUnique({ where: { id: params.id } });
    if (!blog) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    console.error("[BLOG_GET_ONE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Blog ID missing", { status: 400 });
    }
    const values = await req.json();
    const blog = await db.blogs.update({
      where: { id: params.id },
      data: values,
    });
    return NextResponse.json(blog);
  } catch (error) {
    console.error("[BLOG_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return new NextResponse("Blog ID missing", { status: 400 });
    }
    await db.blogs.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BLOG_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
