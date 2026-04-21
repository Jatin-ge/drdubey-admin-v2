import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const API_BASE = 'https://graph.facebook.com/v22.0'

type MetaComponent = {
  type: string
  text?: string
}

type MetaTemplate = {
  name: string
  status: string
  language: string
  category?: string
  components?: MetaComponent[]
}

function extractBody(components?: MetaComponent[]): string {
  if (!Array.isArray(components)) return ''
  const body = components.find(c => c.type === 'BODY')
  return body?.text || ''
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{\d+\}\}/g)
  return matches ? Array.from(new Set(matches)) : []
}

function mapLanguage(metaLang: string): string {
  if (metaLang === 'hi' || metaLang === 'hi_IN') return 'hi'
  return 'en'
}

function mapCategory(metaCategory?: string): string {
  if (metaCategory && ['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(metaCategory)) {
    return metaCategory
  }
  return 'UTILITY'
}

function mapStatus(metaStatus: string, fallback: string | null): string {
  if (metaStatus === 'APPROVED') return 'APPROVED'
  if (metaStatus === 'REJECTED') return 'REJECTED'
  if (metaStatus === 'PENDING') return 'PENDING'
  return fallback || 'PENDING'
}

export async function POST() {
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  if (!TOKEN || !WABA_ID) {
    return NextResponse.json(
      { error: 'WhatsApp not configured' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(
      `${API_BASE}/${WABA_ID}/message_templates?limit=200&fields=name,status,language,category,components`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch templates from Meta' },
        { status: 500 }
      )
    }

    const data = await res.json()
    const metaTemplates: MetaTemplate[] = data.data || []

    const metaMap = new Map<string, MetaTemplate>()
    for (const t of metaTemplates) {
      metaMap.set(t.name, t)
    }

    const dbTemplates = await db.whatsAppTemplate.findMany()
    const dbMetaNames = new Set(
      dbTemplates.map(t => t.metaName).filter((n): n is string => !!n)
    )

    let synced = 0
    let updated = 0
    let imported = 0

    for (const tmpl of dbTemplates) {
      if (!tmpl.metaName && tmpl.metaStatus === 'DRAFT') continue

      const metaName = tmpl.metaName || ''
      const metaEntry = metaMap.get(metaName)

      if (metaEntry) {
        const newStatus = mapStatus(metaEntry.status, tmpl.metaStatus)
        const isApproved = metaEntry.status === 'APPROVED'

        if (newStatus !== tmpl.metaStatus || isApproved !== tmpl.isApproved) {
          await db.whatsAppTemplate.update({
            where: { id: tmpl.id },
            data: {
              metaStatus: newStatus,
              isApproved,
              metaError: metaEntry.status === 'REJECTED' ? 'Rejected by Meta' : null,
            },
          })
          updated++
        }
        synced++
      }
    }

    for (const meta of metaTemplates) {
      if (dbMetaNames.has(meta.name)) continue

      const bodyText = extractBody(meta.components)
      if (!bodyText) continue

      const language = mapLanguage(meta.language)
      const category = mapCategory(meta.category)
      const status = mapStatus(meta.status, 'PENDING')
      const isApproved = meta.status === 'APPROVED'

      await db.whatsAppTemplate.create({
        data: {
          name: meta.name,
          nameHi: null,
          category,
          language,
          bodyEn: language === 'en' ? bodyText : '',
          bodyHi: language === 'hi' ? bodyText : '',
          variables: extractVariables(bodyText),
          metaName: meta.name,
          isApproved,
          isActive: true,
          metaStatus: status,
          metaSubmittedAt: new Date(),
        },
      })
      imported++
    }

    return NextResponse.json({
      success: true,
      metaTemplates: metaTemplates.length,
      dbTemplates: dbTemplates.length,
      synced,
      updated,
      imported,
    })
  } catch (error: any) {
    console.error('[WA_TEMPLATE_SYNC]', error)
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
}
