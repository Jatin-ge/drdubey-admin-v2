import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

const PHONE_ID = process.env.WHATSAPP_PHONE_ID
const TOKEN = process.env.WHATSAPP_API_TOKEN
const GRAPH_URL = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^0/, '')
  return digits.startsWith('91') ? digits : `91${digits}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      phone,
      templateName,
      language = 'hi',
      parameters = [],
    } = body

    if (!phone || !templateName) {
      return NextResponse.json(
        { error: 'phone and templateName required' },
        { status: 400 }
      )
    }

    const to = formatPhone(phone)

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language === 'hi' ? 'hi' : 'en_US'
        },
      }
    }

    if (parameters.length > 0) {
      payload.template.components = [{
        type: 'body',
        parameters: parameters.map((p: string) => ({
          type: 'text',
          text: p,
        }))
      }]
    }

    const res = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('WhatsApp API error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Send failed' },
        { status: res.status }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
    })

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    )
  }
}
