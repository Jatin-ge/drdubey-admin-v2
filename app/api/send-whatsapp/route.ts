import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const WHATSAPP_API_BASE = "https://graph.facebook.com";
const API_VERSION = "v22.0";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.templateName || !body.recipients || !Array.isArray(body.recipients)) {
      return NextResponse.json({
        error: "Template name and recipients array are required"
      }, { status: 400 });
    }

    const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    const TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!PHONE_ID || !TOKEN) {
      return NextResponse.json({
        error: "WhatsApp not configured — missing WHATSAPP_PHONE_ID or WHATSAPP_API_TOKEN"
      }, { status: 500 });
    }

    // Verify template exists in our database
    const template = await db.metaTemplate.findUnique({
      where: { name: body.templateName }
    });

    if (!template) {
      return NextResponse.json({
        error: "Template not found in database"
      }, { status: 404 });
    }

    const results = [];
    const errors = [];

    // Send message to each recipient
    for (const recipient of body.recipients) {
      try {
        const messageData = {
          messaging_product: "whatsapp",
          to: recipient.phone,
          type: "template",
          template: {
            name: body.templateName,
            language: {
              code: body.language || "en_US"
            },
            components: body.parameters ? [
              {
                type: "body",
                parameters: body.parameters.map((param: string) => ({
                  type: "text",
                  text: param
                }))
              }
            ] : undefined
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
            body: JSON.stringify(messageData)
          }
        );

        if (response.ok) {
          const result = await response.json();
          results.push({
            phone: recipient.phone,
            name: recipient.name,
            success: true,
            messageId: result.messages[0].id
          });
        } else {
          const error = await response.json();
          errors.push({
            phone: recipient.phone,
            name: recipient.name,
            error: error.error?.message || 'Failed to send message'
          });
        }
      } catch (error) {
        errors.push({
          phone: recipient.phone,
          name: recipient.name,
          error: 'Network error'
        });
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error("[SEND_WHATSAPP]", error);
    return NextResponse.json({ error: "Failed to send messages" }, { status: 500 });
  }
} 