import { NextResponse } from "next/server";

const WHATSAPP_API_BASE = "https://graph.facebook.com";
const API_VERSION = "v22.0";

// Send Template Message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, template } = body;

    // Validate required fields
    if (!template?.name || !to) {
      return NextResponse.json({
        error: "Template name and recipient phone number are required"
      }, { status: 400 });
    }

    const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    const TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!PHONE_ID || !TOKEN) {
      return NextResponse.json({
        error: "WhatsApp not configured — missing WHATSAPP_PHONE_ID or WHATSAPP_API_TOKEN"
      }, { status: 500 });
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

    const response = await fetch(
      `${WHATSAPP_API_BASE}/${API_VERSION}/${PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappBody)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error sending WhatsApp message:", data);
      return NextResponse.json({
        error: data.error?.message || "Failed to send message"
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json({
      error: error.message || "Failed to send message"
    }, { status: 500 });
  }
}
