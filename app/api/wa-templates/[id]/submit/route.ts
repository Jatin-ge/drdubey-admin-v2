import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const API_BASE = 'https://graph.facebook.com/v22.0'

function toMetaName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  if (!TOKEN || !WABA_ID) {
    return NextResponse.json(
      { error: 'WhatsApp not configured' },
      { status: 500 }
    )
  }

  try {
    // 1. Fetch template from DB
    const template = await db.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 2. Determine body text and meta name
    const bodyText = template.language === 'hi'
      ? template.bodyHi
      : template.bodyEn

    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { error: 'Template body is empty' },
        { status: 400 }
      )
    }

    const metaName = template.metaName || toMetaName(template.name)

    // Map language to Meta format
    const metaLanguage = template.language === 'hi' ? 'hi'
      : template.language === 'en' ? 'en_US'
      : template.language

    // Map category
    const metaCategory = template.category === 'MARKETING' ? 'MARKETING'
      : template.category === 'UTILITY' ? 'UTILITY'
      : template.category === 'AUTHENTICATION' ? 'AUTHENTICATION'
      : 'UTILITY'

    // 3. Build components
    const components = [
      {
        type: 'BODY',
        text: bodyText.trim(),
      },
    ]

    // 4. Submit to Meta
    const payload = {
      name: metaName,
      language: metaLanguage,
      category: metaCategory,
      components,
    }

    const res = await fetch(
      `${API_BASE}/${WABA_ID}/message_templates`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      // Update template with error
      await db.whatsAppTemplate.update({
        where: { id: params.id },
        data: {
          metaStatus: 'REJECTED',
          metaError: data.error?.message || 'Submission failed',
        },
      })

      return NextResponse.json(
        {
          error: data.error?.message || 'Failed to submit template',
          details: data.error,
        },
        { status: res.status }
      )
    }

    // 5. Success — update template status
    await db.whatsAppTemplate.update({
      where: { id: params.id },
      data: {
        metaName: metaName,
        metaStatus: 'PENDING',
        metaError: null,
        metaSubmittedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      metaId: data.id,
      metaName: metaName,
      status: data.status,
    })
  } catch (error: any) {
    console.error('[WA_TEMPLATE_SUBMIT]', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
