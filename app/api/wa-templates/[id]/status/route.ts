import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const API_BASE = 'https://graph.facebook.com/v22.0'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const TOKEN = process.env.WHATSAPP_API_TOKEN
  const WABA_ID = process.env.WHATSAPP_WABA_ID

  if (!TOKEN || !WABA_ID) {
    return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 500 })
  }

  try {
    const template = await db.whatsAppTemplate.findUnique({
      where: { id: params.id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!template.metaName || template.metaStatus === 'DRAFT') {
      return NextResponse.json({
        id: template.id,
        metaStatus: template.metaStatus || 'DRAFT',
        changed: false,
      })
    }

    // Check Meta for this template's status
    const res = await fetch(
      `${API_BASE}/${WABA_ID}/message_templates?name=${template.metaName}&fields=name,status,language`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      }
    )

    if (!res.ok) {
      return NextResponse.json({
        id: template.id,
        metaStatus: template.metaStatus,
        changed: false,
        error: 'Failed to check Meta',
      })
    }

    const data = await res.json()
    const metaTemplate = data.data?.[0]

    if (!metaTemplate) {
      // Template doesn't exist on Meta (might have been deleted)
      if (template.metaStatus !== 'DRAFT') {
        await db.whatsAppTemplate.update({
          where: { id: params.id },
          data: { metaStatus: 'DRAFT', metaError: 'Template not found on Meta', isApproved: false },
        })
      }
      return NextResponse.json({
        id: template.id,
        metaStatus: 'DRAFT',
        changed: template.metaStatus !== 'DRAFT',
      })
    }

    // Map Meta status
    const newStatus = metaTemplate.status === 'APPROVED' ? 'APPROVED'
      : metaTemplate.status === 'REJECTED' ? 'REJECTED'
      : metaTemplate.status === 'PENDING' ? 'PENDING'
      : template.metaStatus

    const changed = newStatus !== template.metaStatus

    if (changed) {
      await db.whatsAppTemplate.update({
        where: { id: params.id },
        data: {
          metaStatus: newStatus,
          isApproved: newStatus === 'APPROVED',
          metaError: newStatus === 'REJECTED' ? 'Rejected by Meta' : null,
        },
      })
    }

    return NextResponse.json({
      id: template.id,
      metaStatus: newStatus,
      changed,
      metaTemplateStatus: metaTemplate.status,
    })
  } catch (error: any) {
    console.error('[WA_TEMPLATE_STATUS]', error)
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    )
  }
}
