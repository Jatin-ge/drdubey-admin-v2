import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { templates } = body;

    const results = {
      created: [] as any[],
      skipped: [] as string[],
    };

    // Process templates one by one to handle duplicates
    for (const template of templates) {
      try {
        // Check if template already exists
        const existing = await db.template.findUnique({
          where: { name: template.name }
        });

        if (existing) {
          results.skipped.push(template.name);
          continue;
        }

        // Create new template with required fields
        const created = await db.template.create({
          data: {
            name: template.name,
            displayName: template.displayName,
            category: template.category,
            language: template.language,
            bodyContent: template.bodyContent || "Default body content",
            headerType: template.headerType || "NONE",
            headerContent: template.headerContent,
            footerContent: template.footerContent,
            buttons: template.buttons ? {
              create: template.buttons.map((button: any) => ({
                type: button.type,
                text: button.text,
                url: button.url,
                order: button.order || 0
              }))
            } : undefined
          },
        });
        results.created.push(created);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') { // Unique constraint error
            results.skipped.push(template.name);
            continue;
          }
        }
        throw error; // Re-throw other errors
      }
    }

    return NextResponse.json({
      success: true,
      created: results.created.length,
      skipped: results.skipped,
      message: `Created ${results.created.length} templates. ${results.skipped.length} templates skipped (already exist).`
    });
  } catch (error) {
    console.error("[TEMPLATES_BULK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 