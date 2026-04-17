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

export async function GET() {
  try {
    const templates = await db.whatsAppTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(templates)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('WA Template GET error:', msg)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  try {
    const body = await req.json()

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      )
    }

    const metaName = body.metaName?.trim() || toMetaName(body.name)
    const language = body.language || 'hi'
    const bodyText = language === 'hi'
      ? (body.bodyHi?.trim() || '')
      : (body.bodyEn?.trim() || '')

    if (!bodyText) {
      return NextResponse.json(
        { error: 'Template body content is required' },
        { status: 400 }
      )
    }

    // 1. Save to DB first
    const template = await db.whatsAppTemplate.create({
      data: {
        name: body.name.trim(),
        nameHi: body.nameHi?.trim() || null,
        category: body.category || 'UTILITY',
        language,
        bodyEn: body.bodyEn?.trim() || '',
        bodyHi: body.bodyHi?.trim() || '',
        variables: Array.isArray(body.variables) ? body.variables : [],
        metaName,
        isApproved: false,
        isActive: true,
        metaStatus: 'DRAFT',
      }
    })

    // 2. Auto-submit to Meta
    if (TOKEN && WABA_ID) {
      try {
        const metaLanguage = language === 'hi' ? 'hi' : 'en_US'
        const metaCategory = ['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(body.category)
          ? body.category : 'UTILITY'

        const res = await fetch(
          `${API_BASE}/${WABA_ID}/message_templates`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: metaName,
              language: metaLanguage,
              category: metaCategory,
              components: [{ type: 'BODY', text: bodyText }],
            }),
          }
        )

        const data = await res.json()

        if (res.ok) {
          // Submitted successfully
          await db.whatsAppTemplate.update({
            where: { id: template.id },
            data: {
              metaStatus: 'PENDING',
              metaSubmittedAt: new Date(),
              metaError: null,
            },
          })
          template.metaStatus = 'PENDING'
        } else {
          // Submission failed
          await db.whatsAppTemplate.update({
            where: { id: template.id },
            data: {
              metaStatus: 'REJECTED',
              metaError: data.error?.message || 'Submission failed',
            },
          })
          template.metaStatus = 'REJECTED'
          template.metaError = data.error?.message || 'Submission failed'
        }
      } catch (metaErr: any) {
        await db.whatsAppTemplate.update({
          where: { id: template.id },
          data: {
            metaStatus: 'REJECTED',
            metaError: metaErr.message || 'Network error',
          },
        })
        template.metaStatus = 'REJECTED'
        template.metaError = metaErr.message || 'Network error'
      }
    }

    return NextResponse.json(template)

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create template'
    console.error('WA Template POST error:', msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
