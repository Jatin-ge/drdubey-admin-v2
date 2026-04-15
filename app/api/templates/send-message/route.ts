import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const WHATSAPP_API_BASE = "https://graph.facebook.com";
const API_VERSION = "v22.0";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template, phone } = body;

    if (!template || !phone) {
      return NextResponse.json({
        error: "Template name and phone number are required"
      }, { status: 400 });
    }

    const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    const TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (!PHONE_ID || !TOKEN) {
      return NextResponse.json({
        error: "WhatsApp not configured — missing env vars"
      }, { status: 500 });
    }

    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;

    const whatsappBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: template.toLowerCase(),
        language: { code: "en_US" }
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

    // Log to WhatsAppMessageLog
    await db.whatsAppMessageLog.create({
      data: {
        phone: formattedPhone,
        templateName: template.toLowerCase(),
        language: 'en_US',
        variables: [],
        status: response.ok ? 'SENT' : 'FAILED',
        messageId: data.messages?.[0]?.id || null,
        errorMsg: response.ok ? null : (data.error?.message || 'Failed'),
        source: 'template-send',
      }
    }).catch(e => console.error('[MSG_LOG]', e));

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
