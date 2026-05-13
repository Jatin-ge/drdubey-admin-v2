import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildMetaComponents } from '@/lib/wa-template-components'
import {
  validateButtons,
  serializeButtons,
  type TemplateButton,
} from '@/lib/wa-template-buttons'
import { isSendableMediaUrl } from '@/lib/wa-media-url'
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

    const headerType = (body.headerType || 'NONE').toUpperCase()
    if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType)) {
      const mediaUrl = body.headerMediaUrl?.trim()
      if (!mediaUrl) {
        return NextResponse.json(
          { error: `Header type ${headerType} requires a public media URL` },
          { status: 400 }
        )
      }
      // Reject resumable handles + Meta-internal CDN URLs — neither work
      // when Meta tries to fetch the media at send time. The user must
      // provide a URL we control or any public host.
      if (!isSendableMediaUrl(mediaUrl)) {
        return NextResponse.json(
          {
            error:
              `Media URL must be a public HTTPS URL on a non-Meta host ` +
              `(scontent.whatsapp.net / fbcdn / lookaside are rejected). ` +
              `Got: ${mediaUrl.slice(0, 80)}`,
          },
          { status: 400 }
        )
      }
    }
    if (headerType === 'TEXT' && !body.headerText?.trim()) {
      return NextResponse.json(
        { error: 'Header type TEXT requires headerText' },
        { status: 400 }
      )
    }

    // Buttons: validate and serialize. Empty array = no buttons (cleared
    // in the form). Undefined would mean "client didn't send the field"
    // but on create that's effectively no buttons too.
    const incomingButtons: TemplateButton[] = Array.isArray(body.buttons)
      ? body.buttons
      : []
    const buttonsCheck = validateButtons(incomingButtons)
    if (!buttonsCheck.ok) {
      return NextResponse.json({ error: buttonsCheck.error }, { status: 400 })
    }
    const buttonsJson = incomingButtons.length
      ? serializeButtons(incomingButtons)
      : null

    const skipMetaSubmit = body.skipMetaSubmit === true

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
        headerType,
        headerText: body.headerText?.trim() || null,
        headerMediaUrl: body.headerMediaUrl?.trim() || null,
        headerMediaSendUrl: body.headerMediaSendUrl?.trim() || null,
        footerText: body.footerText?.trim() || null,
        buttonsJson,
        isApproved: false,
        isActive: true,
        metaStatus: 'DRAFT',
      }
    })

    // 2. Auto-submit to Meta (unless caller explicitly opted out)
    if (TOKEN && WABA_ID && !skipMetaSubmit) {
      try {
        const metaLanguage = language === 'hi' ? 'hi' : 'en_US'
        const metaCategory = ['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(body.category)
          ? body.category : 'UTILITY'

        const components = buildMetaComponents(bodyText, {
          headerType,
          headerText: body.headerText,
          headerMediaUrl: body.headerMediaUrl,
          footerText: body.footerText,
          buttonsJson,
        })

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
              components,
            }),
          }
        )

        const data = await res.json()

        if (res.ok) {
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
