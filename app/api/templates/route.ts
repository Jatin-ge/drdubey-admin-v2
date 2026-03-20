import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whatsappApi } from "@/lib/whatsapp-api";
import { TemplateCategory } from "@prisma/client";

const WHATSAPP_API_BASE = "https://graph.facebook.com";

// Define allowed button types
const BUTTON_TYPES = {
  QUICK_REPLY: "QUICK_REPLY",
  VISIT_WEBSITE: "URL",
  CALL_PHONE: "PHONE_NUMBER",
  COPY_CODE: "COPY_CODE",
} as const;

// Add helper function for date formatting
const formatDate = (text: string): string => {
  // Replace date patterns like "18 May" or "13 May 2025" with proper format
  return text.replace(
    /(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{4})?/gi,
    (match, day, month, year) => {
      const formattedDay = day.padStart(2, '0');
      const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1, 3);
      return `${formattedDay} ${formattedMonth}${year ? ' ' + year : ''}`;
    }
  );
};

// Add helper function for time formatting
const formatTime = (text: string): string => {
  // Convert times like "10:00 am" or "10:30AM" to "10:00 AM"
  return text.replace(
    /(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/g,
    (match, hour, minutes, meridiem) => {
      const formattedHour = hour.padStart(2, '0');
      const formattedMinutes = minutes ? minutes : '00';
      return `${formattedHour}:${formattedMinutes} ${meridiem.toUpperCase()}`;
    }
  );
};

// Add helper function for content formatting
const formatContent = (content: string, isHeader: boolean = false): string => {
  let text = content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/<p>/g, '') // Remove opening p tags
    .replace(/<\/p>/g, '\n') // Replace closing p tags with newline
    .replace(/<br\s*\/?>/g, '\n') // Replace br tags with newline
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .trim(); // Initial trim

  if (isHeader) {
    // For headers: remove all line breaks and extra spaces
    return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // First, split into sections and clean each section
  const sections = text.split(/\n/).map(line => line.trim()).filter(Boolean);
  
  // Now join sections with appropriate spacing
  text = sections.join('\n');

  // Add line breaks in specific places
  text = text
    // Add newline after doctor name and title
    .replace(/(Dr\.[^,]+,[^)]+)/, '$&\n')
    // Add newline after experience, ensuring parentheses are on same line
    .replace(/(\([^)]+successful[^)]+\))/, '$&\n')
    // Add double newline after hospital name
    .replace(/(Services from[^📍\n]+)/, '$&\n\n')
    // Add newline before and after location section
    .replace(/(?=📍)/, '\n')
    .replace(/(Time:[^\n📌]+)/, '$&\n')
    // Add newline before and after appointment section
    .replace(/(?=📌)/, '\n')
    // Ensure proper ending with period
    .replace(/(\S)$/, '$1.');

  // Clean up the formatting
  return text
    .replace(/\n{3,}/g, '\n\n') // Replace triple+ newlines with double
    .replace(/\s+\n/g, '\n') // Remove spaces before newlines
    .replace(/\n\s+/g, '\n') // Remove spaces after newlines
    .split('\n')
    .map(line => line.trim()) // Trim each line
    .join('\n')
    .trim(); // Final trim
};

// Create Template
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received template request:", body);

    // Validate required fields
    if (!body.name || !body.category || !body.language || !body.bodyContent) {
      return NextResponse.json({ 
        error: "Name, category, language and body content are required" 
      }, { status: 400 });
    }

    // Clean and format body content
    let cleanBodyContent = formatContent(body.bodyContent, false);

    // Format dates and times
    cleanBodyContent = formatDate(cleanBodyContent);
    cleanBodyContent = formatTime(cleanBodyContent);

    // For media headers, ensure content is provided
    if (body.headerType && body.headerType !== "NONE" && body.headerType !== "TEXT" && !body.headerContent) {
      return NextResponse.json({ 
        error: `Header content is required for ${body.headerType} type` 
      }, { status: 400 });
    }

    // Clean header content if it exists
    let cleanHeaderContent = "";
    if (body.headerContent) {
      cleanHeaderContent = formatContent(body.headerContent, true);
      cleanHeaderContent = formatDate(cleanHeaderContent);
      cleanHeaderContent = formatTime(cleanHeaderContent);
    }

    try {
      // Format components for WhatsApp API
      const formatButton = (button: any) => {
        switch (button.type) {
          case "URL":
            return {
              type: "URL",
              text: button.text,
              url: button.url
            };
          case "PHONE_NUMBER":
            return {
              type: "PHONE_NUMBER",
              text: button.text,
              phone_number: `${button.country}${button.phoneNumber}`
            };
          case "COPY_CODE":
            return {
              type: "COPY_CODE",
              text: button.text,
              code: button.copyCode
            };
          default:
            return {
              type: button.type,
              text: button.text
            };
        }
      };

      const components = [
        // Header (if exists)
        body.headerType !== "NONE" && body.headerContent && {
          type: "HEADER",
          format: body.headerType,
          text: body.headerType === "TEXT" ? cleanHeaderContent : undefined,
          example: {
            header_text: body.headerType === "TEXT" ? [cleanHeaderContent] : undefined,
            header_handle: body.headerType !== "TEXT" ? [body.headerContent] : undefined,
          },
        },
        // Body (required)
        {
          type: "BODY",
          text: cleanBodyContent,
        },
        // Footer (optional)
        body.footerContent && {
          type: "FOOTER",
          text: body.footerContent.replace(/<[^>]*>/g, '').trim(),
        },
        // Buttons (if any)
        body.buttons && body.buttons.length > 0 && {
          type: "BUTTONS",
          buttons: body.buttons.map(formatButton).filter(Boolean)
        }
      ].filter(Boolean);

      const whatsappResponse = await fetch(
        `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: body.name,
            language: body.language,
            category: body.category,
            components
          })
        }
      );

      if (!whatsappResponse.ok) {
        const error = await whatsappResponse.json();
        console.error("WhatsApp API Error:", error);
        throw new Error(error.error?.message || 'Failed to create WhatsApp template');
      }

      // Create in database with clean body content
      const template = await db.template.create({
        data: {
          name: body.name,
          displayName: body.displayName,
          category: body.category,
          language: body.language,
          headerType: body.headerType || "NONE",
          headerContent: body.headerContent || null,
          bodyContent: cleanBodyContent, // Use cleaned body content
          footerContent: body.footerContent || null,
          buttons: body.buttons ? {
            create: body.buttons.map((button: any, index: number) => ({
              type: button.type,
              text: button.text,
              url: button.type === "URL" ? button.url : null,
              order: index
            }))
          } : undefined
        },
        include: {
          buttons: true
        }
      });

      return NextResponse.json(template);
    } catch (error: any) {
      console.error("[TEMPLATES_POST]", error);
      return NextResponse.json({ 
        error: error.message || "Failed to create template",
        details: error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[TEMPLATE_CREATE] Request processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get All Templates
export async function GET() {
  try {
    // First clean up any invalid templates
    await db.template.deleteMany({
      where: {
        OR: [
          { name: { equals: "" } },
          { displayName: { equals: "" } },
          { language: { equals: "" } },
          { bodyContent: { equals: "" } }
        ]
      }
    });

    // Then fetch valid templates with simpler conditions
    const templates = await db.template.findMany({
      where: {
        name: { not: "" },
        displayName: { not: "" },
        category: {
          in: [
            "MARKETING",
            "UTILITY", 
            "AUTHENTICATION"
          ]
        },
        language: { not: "" },
        bodyContent: { not: "" }
      },
      include: {
        buttons: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// Delete Template
export async function DELETE(req: Request) {
  try {
    const { name } = await req.json();
    
    // Delete from WhatsApp first
    try {
      await whatsappApi.deleteMessageTemplate(name);
    } catch (error) {
      console.error("[WHATSAPP_TEMPLATE_DELETE]", error);
      // Continue with database deletion even if WhatsApp deletion fails
    }

    // Then delete from database
    await db.template.delete({
      where: { name }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TEMPLATES_DELETE]", error);
    return NextResponse.json({ 
      error: "Failed to delete template" 
    }, { status: 500 });
  }
} 