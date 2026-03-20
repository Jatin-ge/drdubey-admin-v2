import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Get all Meta templates
export async function GET() {
  try {
    const templates = await db.metaTemplate.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[META_TEMPLATES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// Add new Meta template
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name || !body.displayName) {
      return NextResponse.json({ 
        error: "Template name and display name are required" 
      }, { status: 400 });
    }

    // Check if template already exists
    const existingTemplate = await db.metaTemplate.findUnique({
      where: { name: body.name }
    });

    if (existingTemplate) {
      return NextResponse.json({ 
        error: "Template with this name already exists" 
      }, { status: 400 });
    }

    const template = await db.metaTemplate.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        description: body.description || null
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[META_TEMPLATES_POST]", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// Delete Meta template
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    await db.metaTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[META_TEMPLATES_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
} 