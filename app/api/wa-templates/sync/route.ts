import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const API_BASE = 'https://graph.facebook.com/v22.0'

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
    // 1. Fetch ALL templates from Meta
    const res = await fetch(
      `${API_BASE}/${WABA_ID}/message_templates?limit=200&fields=name,status,language,category`,
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
    const metaTemplates = data.data || []

    // 2. Build a map of Meta templates by name
    const metaMap = new Map<string, { status: string; language: string }>()
    for (const t of metaTemplates) {
      metaMap.set(t.name, { status: t.status, language: t.language })
    }

    // 3. Fetch all DB templates
    const dbTemplates = await db.whatsAppTemplate.findMany()

    let synced = 0
    let updated = 0

    for (const tmpl of dbTemplates) {
      if (!tmpl.metaName && tmpl.metaStatus === 'DRAFT') continue

      const metaName = tmpl.metaName || ''
      const metaEntry = metaMap.get(metaName)

      if (metaEntry) {
        const newStatus = metaEntry.status === 'APPROVED' ? 'APPROVED'
          : metaEntry.status === 'REJECTED' ? 'REJECTED'
          : metaEntry.status === 'PENDING' ? 'PENDING'
          : tmpl.metaStatus

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

    return NextResponse.json({
      success: true,
      metaTemplates: metaTemplates.length,
      dbTemplates: dbTemplates.length,
      synced,
      updated,
    })
  } catch (error: any) {
    console.error('[WA_TEMPLATE_SYNC]', error)
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
}
