import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blogs = await db.blogs.findMany({
      orderBy: [{ isPublished: "desc" }, { publishedAt: "desc" }],
      take: 100,
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("[BLOGS_GET]", error);
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
    const blog = await db.blogs.create({
      data: { ...values, slug },
    });
    return NextResponse.json(blog);
  } catch (error) {
    console.error("[BLOGS_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
