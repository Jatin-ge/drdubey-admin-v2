import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
      leadId,
    } = body

    if (!phone || !templateName) {
      return NextResponse.json(
        { error: 'phone and templateName required' },
        { status: 400 }
      )
    }

    if (!PHONE_ID || !TOKEN) {
      return NextResponse.json(
        { error: 'WhatsApp not configured — missing env vars' },
        { status: 500 }
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

    // Log to WhatsAppMessageLog
    await db.whatsAppMessageLog.create({
      data: {
        leadId: leadId || null,
        phone: to,
        templateName,
        language: language === 'hi' ? 'hi' : 'en_US',
        variables: parameters,
        status: res.ok ? 'SENT' : 'FAILED',
        messageId: data.messages?.[0]?.id || null,
        errorMsg: res.ok ? null : (data.error?.message || 'Send failed'),
        source: 'individual',
      }
    }).catch(e => console.error('[MSG_LOG]', e))

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
