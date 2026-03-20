import { NextResponse } from "next/server";
import axios from "axios";

const WHATSAPP_API_BASE = "https://graph.facebook.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template, phone } = body;

    if (!template || !phone) {
      return NextResponse.json({ 
        error: "Template name and phone number are required" 
      }, { status: 400 });
    }

    // Format phone number if needed
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;

    const whatsappBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: template.toLowerCase(),
        language: {
          code: "en_US"
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