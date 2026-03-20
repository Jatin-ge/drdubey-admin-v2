import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Update Template
export async function PATCH(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const body = await req.json();
    
    if (!body.bodyContent) {
      return NextResponse.json({ 
        error: "Body content is required" 
      }, { status: 400 });
    }

    const template = await db.template.update({
      where: {
        id: params.templateId
      },
      data: {
        displayName: body.displayName,
        category: body.category,
        language: body.language,
        headerType: body.headerType || "NONE",
        headerContent: body.headerContent || null,
        bodyContent: body.bodyContent,
        footerContent: body.footerContent || null,
        buttons: {
          deleteMany: {},
          create: body.buttons?.map((button: any, index: number) => ({
            type: button.type,
            text: button.text,
            url: button.url,
            order: index
          }))
        }
      },
      include: {
        buttons: true
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete Template
export async function DELETE(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    await db.template.delete({
      where: {
        id: params.templateId
      }
    });

    return NextResponse.json({ message: "Template deleted" });
  } catch (error) {
    console.error("[TEMPLATE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 