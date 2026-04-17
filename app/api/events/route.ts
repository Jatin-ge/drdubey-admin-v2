import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const values = await req.json();

    // Validate required fields
    if (!values.title?.trim() || !values.description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" }, 
        { status: 400 }
      );
    }

    // Clean up the data before saving
    const eventData = {
      title: values.title.trim(),
      description: values.description.trim(),
      videoLink: values.mediaType === 'video' ? values.videoLink : null,
      imageUrl: values.mediaType === 'image' ? values.imageUrl : null,
    };

    const event = await db.event.create({
      data: eventData
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("❌ Error creating event:", error);
    return NextResponse.json(
      { 
        error: "Failed to create event", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...values } = await req.json();
    
    // Clean up the data before updating
    const eventData = {
      title: values.title,
      description: values.description,
      videoLink: values.mediaType === 'video' ? values.videoLink : null,
      imageUrl: values.mediaType === 'image' ? values.imageUrl : null,
    };

    const event = await db.event.update({
      where: { id },
      data: eventData,
    });
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await db.event.delete({ where: { id } });
    return NextResponse.json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
} 