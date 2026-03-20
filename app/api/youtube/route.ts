import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const values = await req.json();
    console.log("values", values);

    // Validate required fields
    if (!values.title || !values.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Create a new event with video link or image URL
    const event = await db.event.create({
      data: {
        title: values.title,
        description: values.description,
        videoLink: values.videoLink || null,
        imageUrl: values.imageUrl || null,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[EVENT_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
