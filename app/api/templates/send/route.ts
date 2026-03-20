import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whatsappApi } from "@/lib/whatsapp-api";
import axios from "axios";

const WHATSAPP_API_BASE = "https://graph.facebook.com";

// Create Template
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messaging_product, recipient_type, to, type, template } = body;

    // Validate required fields
    if (!template?.name || !to) {
      return NextResponse.json({ 
        error: "Template name and recipient phone number are required" 
      }, { status: 400 });
    }

    // Format phone number if needed
    const formattedPhone = to.startsWith('+') ? to.substring(1) : to;

    const whatsappBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: template.name.toLowerCase(),
        language: {
          code: template.language?.code || "en_US"
        }
      }
    };

    // Make sure to use Bearer prefix with token
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const authToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const response = await axios.post(
      `${WHATSAPP_API_BASE}/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      whatsappBody,
      {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error.response?.data || error);
    return NextResponse.json({ 
      error: error.response?.data?.error?.message || "Failed to send message" 
    }, { status: error.response?.status || 500 });
  }
}

// Get All Templates
export async function GET() {
  try {
    // First try to clean up any invalid records
    await db.template.deleteMany({
      where: {
        OR: [
          { bodyContent: { equals: "" } },
           // This handles null/undefined
        ]
      }
    });

    const templates = await db.template.findMany({
      include: {
        buttons: true
      },
      where: {
        AND: [
          { bodyContent: { not: "" } },
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
}

// Update DELETE handler to also delete from WhatsApp
export async function DELETE(req: Request) {
  try {
    const { name } = await req.json();
    
    // Delete from WhatsApp first
    await whatsappApi.deleteMessageTemplate(name);

    // Then delete from database
    await db.template.delete({
      where: { name }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TEMPLATES_DELETE]", error);
    return NextResponse.json({ 
      error: error.message || "Failed to delete template" 
    }, { status: 500 });
  }
} 